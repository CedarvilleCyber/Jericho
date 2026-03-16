import team0Poster from "@/images/team0-poster.jpg";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 flex flex-col mt-4">
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h1 className="text-xl">About Jericho</h1>
          <p className="mt-2">
            Jericho is a cyber-physical city infrastructure lab environment
            designed for hands-on learning and experimentation. It provides a
            realistic simulation of urban infrastructure systems, allowing users
            to explore and understand the complexities of modern cities.
          </p>
        </div>
      </div>
      <div className="card bg-base-100 border border-base-300 mt-4">
        <div className="card-body">
          <h1 className="text-xl">Team 0</h1>
          <Image
            src={team0Poster}
            alt="Team 0 Poster"
            className="w-[50vw] min-w-100 m-3 border-none rounded-lg"
          />
        </div>
      </div>
      <div className="card bg-base-100 border border-base-300 mt-4">
        <div className="card-body">
          <h1 className="text-xl">Team 1</h1>
        </div>
      </div>
    </div>
  );
}
