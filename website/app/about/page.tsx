import { Card, Container } from "@mantine/core";
import Image from "next/image";
import team0Poster from "@/images/team0-poster.jpg";

export default function AboutPage() {
  return (
    <Container className="flex flex-col mt-4" size="lg">
      <Card>
        <h1 className="text-xl">About Jericho</h1>
        <p className="mt-2">
          Jericho is a cyber-physical city infrastructure lab environment
          designed for hands-on learning and experimentation. It provides a
          realistic simulation of urban infrastructure systems, allowing users
          to explore and understand the complexities of modern cities.
        </p>
      </Card>
      <Card className="mt-4">
        <h1 className="text-xl">Team 0</h1>
        <Image
          src={team0Poster}
          alt="Team 0 Poster"
          className="w-[50vw] min-w-100 m-3 border-none rounded-lg"
        />
      </Card>
      <Card className="mt-4">
        <h1 className="text-xl">Team 1</h1>
      </Card>
    </Container>
  );
}
