import { Lightbulb, Volume2, Square } from 'lucide-react';
import React, { useState } from 'react';

function QuestionsSection({ mockInterviewQuestion, activeQuestionIndex, setActiveQuestionIndex }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const textToSpeech = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // ✅ Stop any previous speech before speaking new text
      const speech = new SpeechSynthesisUtterance(text);
      speech.onstart = () => setIsSpeaking(true); // Track if speaking
      speech.onend = () => setIsSpeaking(false);  // Reset when done
      window.speechSynthesis.speak(speech);
    } else {
      alert('Sorry, your browser doesn\'t support text-to-speech.');
    }
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel(); // ✅ Stop ongoing speech
    setIsSpeaking(false);
  };

  return mockInterviewQuestion && (
    <div className="p-5 border rounded-lg my-10">
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
        {Array.isArray(mockInterviewQuestion) && mockInterviewQuestion.length > 0 ? (
          mockInterviewQuestion.map((_, index) => (
            <div 
              key={index} 
              className={`p-2 rounded-full mb-4 text-xs md:text-sm text-center cursor-pointer 
                ${activeQuestionIndex === index ? 'bg-primary text-white' : 'bg-secondary'}`}
              onClick={() => setActiveQuestionIndex(index)}
            >
              <h2>Question #{index + 1}</h2>
            </div>
          ))
        ) : (
          <p>No questions available for this interview.</p>
        )}
      </div>

      <h2 className='my-5 text-md md:text-lg'>
        {mockInterviewQuestion[activeQuestionIndex]?.question}
      </h2>

      {/* ✅ Play and Stop Buttons */}
      <div className="flex gap-3">
        <Volume2 
          className='cursor-pointer text-blue-500' 
          onClick={() => textToSpeech(mockInterviewQuestion[activeQuestionIndex]?.question)}
        />
        
        {isSpeaking && (
          <Square 
            className='cursor-pointer text-red-500' 
            onClick={stopSpeech} 
          />
        )}
      </div>

      <div className='border rounded-lg p-5 bg-blue-100 mt-10'>
        <h2 className='flex gap-2 items-center text-primary'> 
          <Lightbulb />
          <strong>Note:</strong>
        </h2>
        <h2 className='text-sm text-primary my-2'>{process.env.NEXT_PUBLIC_QUESTION_NOTE}</h2>
      </div>
    </div>
  );
}

export default QuestionsSection;
