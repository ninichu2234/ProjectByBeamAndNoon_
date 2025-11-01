import React from 'react';

// --- (Optional) Icons for decoration ---
const LightbulbIcon = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none"
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        className="w-8 h-8 text-[#4A3728] float-left mr-4">
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
        <path d="M9 18h6"/>
        <path d="M10 22h4"/>
    </svg>
);

const PicIcon = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="w-8 h-8 text-[#4A3728] float-left mr-4" 
    >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
        <circle cx="9" cy="9" r="2"/>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
     </svg>
);

export default function AboutUsPage() {
    return (
        <main className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-16 md:py-24">

                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-green-800">
                        About This Project
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        The story behind MyCafe and our smart AI assistant.
                    </p>
                </div>
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-xl">
                    <section className="mb-12">
                        <div className="flex items-start">
                            <LightbulbIcon />
                            <h2 className="text-3xl font-bold text-[#4A3728] mb-4">
                                Our Mission: A Personalised Cafe Experience
                            </h2>
                        </div>
                        <div className="prose prose-lg text-gray-700 leading-relaxed ml-12">
                            <p>
                                Have you ever stared at a long menu, unsure of what to order? Or wished for a coffee that perfectly matched your mood?
                            </p>
                            <p>
                                This project, <strong>MyCafe</strong>, was born from that very challenge. The goal isn't just to build another ordering website, but to create a 
                                <span className="font-semibold text-gray-900"> smarter, more personal cafe experience.</span>
                            </p>
                            <p>
                                By integrating a conversational AI, we aim to:
                            </p>
                            <ul>
                                <li><strong>Reduce decision fatigue</strong> by offering intelligent, personalized menu recommendations.</li>
                                <li><strong>Make ordering accessible</strong> for everyone, allowing users to describe what they want in natural language.</li>
                                <li><strong>Showcase the potential of AI</strong> in everyday applications, making technology feel helpful, not complicated.</li>
                            </ul>
                            <p>
                                This app serves as a demonstration of how modern web technologies (like Next.js, Supabase, and Vercel) can be combined with Large Language Models (LLMs) to build something truly interactive and user-centric.
                            </p>
                        </div>
                    </section>

                    {/* --- Divider --- */}
                    <hr className="my-12 border-gray-200" />

                    {/* --- Section 2: Image Attribution --- */}
                    <section>
                        <div className="flex items-start">
                            <PicIcon />
                            <h2 className="text-3xl font-bold text-[#4A3728] mb-4">
                                A Note on Our Visuals
                            </h2>
                        </div>
                        <div className="prose prose-lg text-gray-700 leading-relaxed ml-12">
                            <p>
                                All the beautiful menu items, cafe scenes, and promotional images you see throughout this website are unique and original.
                            </p>
                            <p>
                                To ensure this project is creative and free from copyright restrictions, <strong className="text-gray-900">none of the images were taken from stock photo websites.</strong>
                            </p>
                            <p>
                                Instead, every visual was meticulously generated using advanced <strong>AI image synthesis tools, specifically Gemini and Copilot.</strong> This approach allows us to create a consistent and imaginative aesthetic for MyCafe without worrying about licensing, making it perfect for a portfolio or demonstration project.
                            </p>
                        </div>
                    </section>

                </div>
            </div>
        </main>
    );
}