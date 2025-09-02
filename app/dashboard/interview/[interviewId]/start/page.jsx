
"use client";
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import QuestionsSection from './_components/QuestionsSection';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic'; // ✅ Added for dynamic import
import { Button } from '@/components/ui/button';

// ✅ Dynamically import RecordAnswerSection with SSR disabled
const RecordAnswerSection = dynamic(
    () => import('@/app/dashboard/_components/RecordAnswerSection'),
    { ssr: false }
);

function StartInterview() {
    const params = useParams();
    const router = useRouter();
    const [interviewData, setInterviewData] = useState(null);
    const [mockInterviewQuestion, setMockInterviewQuestion] = useState([]);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0); // Start at question 1

    useEffect(() => {
        if (!params?.interviewId) {
            console.error("Interview ID is undefined!");
            return;
        }
        GetInterviewDetails();
    }, [params?.interviewId]);

    const GetInterviewDetails = async () => {
        try {
            console.log("Fetching interview details for:", params.interviewId);

            const result = await db
                .select()
                .from(MockInterview)
                .where(eq(MockInterview.mockId, params.interviewId));

            console.log("Database response:", result);

            if (!result || result.length === 0) {
                console.warn("No interview found for this ID:", params.interviewId);
                return;
            }

            const interview = result[0];

            if (!interview.jsonMockResp) {
                console.warn("No questions found for this interview.");
                setMockInterviewQuestion([]);
            } else {
                try {
                    const jsonMockResp = JSON.parse(interview.jsonMockResp);

                    if (Array.isArray(jsonMockResp)) {
                        setMockInterviewQuestion(jsonMockResp);
                    } else {
                        console.warn("Parsed questions are not an array.");
                        setMockInterviewQuestion([]);
                    }
                } catch (parseError) {
                    console.error("Error parsing JSON:", parseError);
                    setMockInterviewQuestion([]);
                }
            }

            setInterviewData(interview);
        } catch (error) {
            console.error("Error fetching interview details:", error);
        }
    };

    const handleEndInterview = () => {
        router.push(`/dashboard/interview/${interviewData?.mockId}/feedback`);
    };

    return (
        <div> 
            {interviewData ? (
                <>
                    <div className="grid grid-cols-1 my-20 md:grid-cols-2 gap-10">
                        {/* Questions Section (Read-only, No Click Navigation) */}
                        <QuestionsSection 
                            mockInterviewQuestion={mockInterviewQuestion} 
                            activeQuestionIndex={activeQuestionIndex}
                            setActiveQuestionIndex={() => {}} // Disable click-based navigation
                        />
                        
                        {/* Record Answer Section */}
                        <RecordAnswerSection 
                            mockInterviewQuestion={mockInterviewQuestion} 
                            activeQuestionIndex={activeQuestionIndex}
                            interviewData={interviewData}
                        />
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-end gap-6">
                        {activeQuestionIndex > 0 && (
                            <Button onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}>
                                Previous Question
                            </Button>
                        )}

                        {activeQuestionIndex !== mockInterviewQuestion?.length - 1 && (
                            <Button onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}>
                                Next Question
                            </Button>
                        )}

                        {activeQuestionIndex === mockInterviewQuestion?.length - 1 && (
                            <Button onClick={handleEndInterview}>
                                End Interview
                            </Button>
                        )}
                    </div>
                </>
            ) : ( 
                <div className="flex justify-center items-center py-10">
                    <p>Loading interview details...</p>
                </div>
            )}
        </div>
    );
}

export default StartInterview;
