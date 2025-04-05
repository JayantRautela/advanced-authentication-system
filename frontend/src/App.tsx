import { Button } from "./components/ui/button"


function App() {
  
  const buttonHandler = () => {
    alert("Frontend Up and Running");
  }

  return (
    <>
      <Button onClick={buttonHandler}>Click Me</Button>
    </>
  )
}

export default App
