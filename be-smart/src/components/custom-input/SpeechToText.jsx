import React from 'react'

export default function SpeechToText() {
  
  function handleClick(){
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log(transcript);
    }

    recognition.start();
  }

  return (
    <div>
      <button className='border-2 border-[black] p-[10px]' onClick={()=>handleClick()}>click to talk</button>
    </div>
  )
}
