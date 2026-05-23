function Timer({ hours, minutes, seconds }) {

return (


<div className="mt-5 text-3xl text-red-500 font-bold">

  {String(hours).padStart(2, "0")} :
  {String(minutes).padStart(2, "0")} :
  {String(seconds).padStart(2, "0")}

</div>


)

}

export default Timer
