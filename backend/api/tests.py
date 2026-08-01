import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from channels.testing import WebsocketCommunicator
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser

from api.models import User, Interview, Question
from backend.asgi import application


# Created using gemini flash 3.5

def _ws_url(interview_id):
    return f"/ws/interview/{interview_id}/"

def _inject_user(user):
    """Bypass Supabase token validation and inject a User into scope."""
    async def _patched(self_mw, scope, receive, send):
        scope["user"] = user
        from channels.middleware import BaseMiddleware
        return await BaseMiddleware.__call__(self_mw, scope, receive, send)
    return patch("api.auth.TokenAuthMiddleware.__call__", _patched)


def _mock_llm(first_q="Tell me about yourself."):
    """Stub ChatGoogleGenerativeAI so no real API calls are made."""
    mock_instance = MagicMock()
    mock_resp = MagicMock()
    mock_resp.content = first_q
    mock_instance.ainvoke = AsyncMock(return_value=mock_resp)
    return patch("api.consumers.ChatGoogleGenerativeAI", return_value=mock_instance)


def _mock_groq():
    """Stub ChatGroq (fallback LLM)."""
    mock_instance = MagicMock()
    mock_resp = MagicMock()
    mock_resp.content = "Fallback question."
    mock_instance.ainvoke = AsyncMock(return_value=mock_resp)
    return patch("api.consumers.ChatGroq", return_value=mock_instance)


def _mock_agent(reply="Can you elaborate on that?"):
    """Stub create_react_agent with a deterministic response."""
    from langchain_core.messages import AIMessage
    mock_agent = MagicMock()
    mock_agent.ainvoke = AsyncMock(
        return_value={"messages": [AIMessage(content=reply)]}
    )
    return patch("api.consumers.create_react_agent", return_value=mock_agent)

@pytest.fixture
def test_user(db):
    return User.objects.create_user(
        email="wstest@example.com",
        username="ws_tester",
        supabase_id="ws-supabase-id-001",
        password="testpass!",
    )


@pytest.fixture
def interview(db, test_user):
    iv = Interview.objects.create(
        user=test_user,
        title="WS Test Interview",
        level="ENTRY",
        mode="PRACTICE",
        duration_seconds=1200,
        status="IN_PROGRESS",
    )
    Question.objects.create(interview=iv, text="Tell me about yourself.", order=1)
    return iv

async def _connect_and_ready(interview, test_user, agent_reply="Can you elaborate?"):
    """
    Connect as test_user, consume 'connected' + first AI question.
    Returns the open WebsocketCommunicator.
    Mocks must be started by the caller.
    """
    comm = WebsocketCommunicator(application, _ws_url(interview.id))
    connected, _ = await comm.connect(timeout=5)
    assert connected, "Connection unexpectedly failed in _connect_and_ready"
    await comm.receive_json_from(timeout=5)   # "connected"
    await comm.receive_json_from(timeout=5)   # first AI question
    return comm

@pytest.mark.django_db(transaction=True)
async def test_unauthenticated_connection_is_rejected(interview):
    """AnonymousUser should be rejected before accept() is called."""
    with _inject_user(AnonymousUser()):
        comm = WebsocketCommunicator(application, _ws_url(interview.id))
        connected, _ = await comm.connect(timeout=5)
        assert not connected, "Unauthenticated connection must be rejected"
        await comm.disconnect()


@pytest.mark.django_db(transaction=True)
async def test_authenticated_connection_accepted(interview, test_user):
    """Valid user gets accepted, receives 'connected' then the first AI question."""
    with _inject_user(test_user), _mock_llm(), _mock_groq(), _mock_agent():
        comm = WebsocketCommunicator(application, _ws_url(interview.id))
        connected, _ = await comm.connect(timeout=5)
        assert connected, "Authenticated user should be accepted"

        msg1 = await comm.receive_json_from(timeout=5)
        assert msg1["type"] == "connected", f"Expected 'connected', got {msg1}"

        msg2 = await comm.receive_json_from(timeout=5)
        assert msg2["type"] == "agent_response", f"Expected agent_response, got {msg2}"
        assert msg2.get("is_question"), "First AI message must have is_question=True"

        await comm.disconnect()


@pytest.mark.django_db(transaction=True)
async def test_wrong_user_is_rejected(interview, db):
    """A user who doesn't own the interview must be rejected."""
    other = await database_sync_to_async(User.objects.create_user)(
        email="other@example.com",
        username="other_ws",
        supabase_id="other-supabase-id-002",
    )
    with _inject_user(other):
        comm = WebsocketCommunicator(application, _ws_url(interview.id))
        connected, _ = await comm.connect(timeout=5)
        assert not connected, "Non-owner must be rejected for another user's interview"
        await comm.disconnect()

@pytest.mark.django_db(transaction=True)
async def test_ws_stays_alive_after_first_question(interview, test_user):
    """
    REGRESSION: WS must NOT close after the AI delivers the first question.

    This was the bug — the frontend cleanup useEffect had [interviewId, isStarted]
    as dependencies, causing closeWS() to fire when interviewId changed.
    On the backend: consumer must never self-close between AI question and user reply.
    """
    with _inject_user(test_user), _mock_llm(), _mock_groq(), _mock_agent("Describe a challenge."):
        comm = await _connect_and_ready(interview, test_user)
        await comm.send_json_to({
            "type": "user_message",
            "text": "I have 2 years of Python experience.",
        })
        resp = await comm.receive_json_from(timeout=10)
        assert resp["type"] in ("agent_response", "error"), (
            f"Expected agent_response — WS disconnected prematurely instead! Got: {resp}"
        )
        await comm.disconnect()


@pytest.mark.django_db(transaction=True)
async def test_ws_does_not_close_between_ai_and_user_turns(interview, test_user):
    """After the AI asks a question, the WS must remain writable for the user."""
    with _inject_user(test_user), _mock_llm("Describe a challenge."), _mock_groq(), _mock_agent("Good. Next?"):
        comm = WebsocketCommunicator(application, _ws_url(interview.id))
        connected, _ = await comm.connect(timeout=5)
        assert connected

        await comm.receive_json_from(timeout=5)  
        first_q = await comm.receive_json_from(timeout=5)
        assert first_q["type"] == "agent_response"

        await comm.send_json_to({
            "type": "user_message",
            "text": "I debugged a memory leak in production.",
        })
        resp = await comm.receive_json_from(timeout=10)
        assert resp["type"] == "agent_response", (
            f"WS was disconnected before user could reply — premature close! Got: {resp}"
        )
        await comm.disconnect()


@pytest.mark.django_db(transaction=True)
async def test_multiple_turns_keep_ws_alive(interview, test_user):
    """Two consecutive user → AI turn exchanges both succeed without WS dropping."""
    from langchain_core.messages import AIMessage

    turn_replies = ["Tell me about a project.", "Which frameworks did you use?"]
    call_count = {"n": 0}

    def make_agent(*args, **kwargs):
        agent = MagicMock()
        async def ainvoke(inp):
            reply = turn_replies[call_count["n"] % len(turn_replies)]
            call_count["n"] += 1
            return {"messages": [AIMessage(content=reply)]}
        agent.ainvoke = ainvoke
        return agent

    with _inject_user(test_user), _mock_llm(), _mock_groq():
        with patch("api.consumers.create_react_agent", side_effect=make_agent):
            comm = WebsocketCommunicator(application, _ws_url(interview.id))
            connected, _ = await comm.connect(timeout=5)
            assert connected
            await comm.receive_json_from(timeout=5)   # connected
            await comm.receive_json_from(timeout=5)   # first question

            await comm.send_json_to({"type": "user_message", "text": "I built a Django REST API."})
            r1 = await comm.receive_json_from(timeout=10)
            assert r1["type"] == "agent_response", f"Turn 1: unexpected response {r1}"
            assert turn_replies[0] in r1.get("text", ""), f"Turn 1 reply mismatch: {r1}"

            await comm.send_json_to({"type": "user_message", "text": "I used Django and FastAPI."})
            r2 = await comm.receive_json_from(timeout=10)
            assert r2["type"] == "agent_response", f"Turn 2: unexpected response {r2}"
            assert turn_replies[1] in r2.get("text", ""), f"Turn 2 reply mismatch: {r2}"

            await comm.disconnect()

@pytest.mark.django_db(transaction=True)
async def test_malformed_json_returns_error(interview, test_user):
    """Non-JSON input must return {"type":"error","message":"Invalid JSON..."}."""
    with _inject_user(test_user), _mock_llm(), _mock_groq(), _mock_agent():
        comm = await _connect_and_ready(interview, test_user)
        await comm.send_to(text_data="{{NOT JSON}}")
        resp = await comm.receive_json_from(timeout=5)
        assert resp["type"] == "error", f"Expected error for malformed JSON, got: {resp}"
        assert "Invalid JSON" in resp.get("message", ""), (
            f"Error message must mention 'Invalid JSON': {resp}"
        )
        await comm.disconnect()


@pytest.mark.django_db(transaction=True)
async def test_unknown_message_type_is_silently_ignored(interview, test_user):
    """An unrecognised 'type' value must produce no response (silent ignore)."""
    with _inject_user(test_user), _mock_llm(), _mock_groq(), _mock_agent():
        comm = await _connect_and_ready(interview, test_user)
        await comm.send_json_to({"type": "heartbeat", "ts": 99999})
        nothing = await comm.receive_nothing(timeout=1.5)
        assert nothing, "Unknown message type should be silently ignored (no reply)"
        await comm.disconnect()


@pytest.mark.django_db(transaction=True)
async def test_empty_user_message_is_ignored(interview, test_user):
    """A user_message with only whitespace text must produce no response."""
    with _inject_user(test_user), _mock_llm(), _mock_groq(), _mock_agent():
        comm = await _connect_and_ready(interview, test_user)
        await comm.send_json_to({"type": "user_message", "text": "   "})
        nothing = await comm.receive_nothing(timeout=1.5)
        assert nothing, "Empty user_message should produce no response"
        await comm.disconnect()


@pytest.mark.django_db(transaction=True)
async def test_clean_client_disconnect_does_not_crash(interview, test_user):
    """A clean client disconnect must not raise any server-side exception."""
    with _inject_user(test_user), _mock_llm(), _mock_groq(), _mock_agent():
        comm = await _connect_and_ready(interview, test_user)
        await comm.disconnect()

@pytest.mark.django_db(transaction=True)
async def test_disconnect_is_logged(interview, test_user):
    """Consumer must log at least one 'disconnected' INFO entry on client close."""
    import logging
    with _inject_user(test_user), _mock_llm(), _mock_groq(), _mock_agent():
        import logging as _logging
        import io

        log_records = []
        handler = _logging.handlers_attached = None

        class _CapHandler(_logging.Handler):
            def emit(self, record):
                log_records.append(record.getMessage())

        logger = _logging.getLogger("api.consumers")
        cap = _CapHandler()
        logger.addHandler(cap)
        original_level = logger.level
        logger.setLevel(_logging.INFO)

        try:
            comm = WebsocketCommunicator(application, _ws_url(interview.id))
            await comm.connect(timeout=5)
            await comm.receive_json_from(timeout=5)  
            await comm.receive_json_from(timeout=5)   
            await comm.disconnect()
        finally:
            logger.removeHandler(cap)
            logger.setLevel(original_level)

        disconnect_logs = [m for m in log_records if "disconnected" in m.lower()]
        assert len(disconnect_logs) > 0, (
            f"Expected a 'disconnected' log from consumer. Got: {log_records}"
        )
