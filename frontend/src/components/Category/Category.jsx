import CardCat from "./CardCat.jsx";

const category = [
  {
    label: "Cognitive Skills",
    title: "Analytical Skills",
    level: "Mid",
    time: "30",
    questions: "9",
    image: "/category/icon1.svg",
  },
  {
    label: "Cognitive Skills",
    title: "Creativity",
    level: "Entry",
    time: "25",
    questions: "10",
    image: "/category/icon2.svg",
  },
  {
    label: "Cognitive Skills",
    title: "Critical Thinking",
    level: "Mid",
    time: "25",
    questions: "9",
    image: "/category/icon3.svg",
  },
  {
    label: "Cognitive Skills",
    title: "Decision-Making",
    level: "Mid",
    time: "30",
    questions: "10",
    image: "/category/icon4.svg",
  },
  {
    label: "Leadership Skills",
    title: "Financial Skills",
    level: "Mid",
    time: "40",
    questions: "10",
    image: "/category/icon5.svg",
  },
  {
    label: "Leadership Skills",
    title: "Leadership",
    level: "Management",
    time: "30",
    questions: "10",
    image: "/category/icon6.svg",
  },
];

export default function Category() {
  return (
    <div className="mx-auto w-full max-w-6xl min-h-screen">
      <div className="flex justify-center flex-row items-center mb-8">
        <div className="flex flex-col mt-12 mb-5 gap-2 items-center">
          <p className="text-gray-400 text-sm">INTERVIEW CATEGORY</p>
          <h1 className="text-white text-2xl text-center">
            Select an Interview
          </h1>
        </div>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-6 mb-44">
        {category.map((step, index) => (
          <div key={index}>
            <CardCat
              index={index}
              label={step.label}
              level={step.level}
              time={step.time}
              questions={step.questions}
              title={step.title}
              image={step.image}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
