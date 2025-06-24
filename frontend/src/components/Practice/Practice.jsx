import CardPrac from "./CardPrac";

const interview = [
    {
        title: 'General Interviews',
        description: 'Covers the questions you are most likely to get while interviewing.',
        tagline: 'Start Interview',
        image: '/dashboard/icon1.svg',
        link:'/interview-setting'
    },
    {
        title: 'Interview by Job Position',
        description: 'Our AI selects the most relevant questions based on your job position',
        tagline: 'Choose Job Position',
        image: '/dashboard/icon2.svg',
        link:'/domain'
    },
    {
        title: 'Custom-Built Interviews',
        description: 'Interview with your own questions, or take assigned interviews.',
        tagline: 'Start Interview',
        image: '/dashboard/icon3.svg',
        link:'/coming-soon'
    }
]

export default function Practice() {
    return (
        <div className="mx-auto w-full max-w-10xl mb-36 min-h-screen">
            <div className='flex justify-center items-center'>
                <div className='flex flex-col mt-12 mb-5' id="hero">
                    <h1 className='text-white text-2xl text-center'>Simulate an Interview</h1>
                </div>
            </div> 

            <div className="flex justify-center items-center gap-6">
                {interview.map((step, index) => (
                    <div key={index} >
                        <div>
                            <CardPrac
                                title={step.title}
                                description={step.description}
                                tagline={step.tagline}
                                image={step.image}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}



   


