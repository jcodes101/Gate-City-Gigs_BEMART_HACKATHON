import React from 'react'

export default function TextToSpeech() {
  
  function handleClick(){
    const text = "hello welcome to text to speech";

    const value = new SpeechSynthesisUtterance(text);

    window.speechSynthesis.speak(value);
}

return (
<div>
    <button className='border-2 border-[black] p-[10px]' onClick={()=>handleClick()}>click to hear</button>
</div>

)
}