export default function Home() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-y-10">
      <div className="w-2/5 flex flex-col items-center">
        <h3 className="text-4xl font-normal">Welcome to</h3>
        <h1 className="text-8xl font-bold">Phase IV</h1>
        <p className="text-normal font-normal text-muted-foreground">Built by Team 18:</p>
        <p className="text-normal font-normal text-muted-foreground">Kevin Chen, Vincent Yang, Mahathi Manikandan, Natasha Vaid</p>
      </div>
      <div>
        <p className="text-normal font-normal">

          Click on one of the buttons at the top to view data
        </p>
      </div>
    </div>
  );
}
