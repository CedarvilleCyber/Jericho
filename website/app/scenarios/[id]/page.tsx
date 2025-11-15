import ScenarioLayout from "@/components/scenario/scenario";
import { ScenarioWithQuestions } from "@/types/scenario";

const ScenarioData: ScenarioWithQuestions = {
  id: "cmhze7pwm000104jreuf34n0m",
  name: "Traffic Lights",
  description:
    "In this scenario, you will learn about web exploitation by investigating " +
    "a local traffic light control system's website for vulnerabilities. We " +
    "have constructed a mock website that simulates something that you might " +
    "find in the real world. Your goal is to identify and exploit vulnerabilities " +
    "in the website to gain unauthorized access to the traffic light control system.",
  topologyMap: "",
  createdAt: new Date("2025-11-14T12:00:00Z"),
  updatedAt: new Date("2025-11-15T12:00:00Z"),
  questions: [
    {
      id: "cmhzeejja000204jr3yyv41xk",
      scenarioId: "cmhze7pwm000104jreuf34n0m",
      title: "What ports are open on the web server? (List in ascending order)",
      placeholder: "1002,3056",
      validation: "^(\\d{1,5})(,\\d{1,5})*$",
      answer: "22,443",
      createdAt: new Date("2025-11-14T12:00:00Z"),
      updatedAt: new Date("2025-11-14T12:00:00Z"),
    },
    {
      id: "cmhzehbaw000304jr4a118iuj",
      scenarioId: "cmhze7pwm000104jreuf34n0m",
      title: "Which page on the web server is exploitable?",
      placeholder: "/path",
      validation: "^/\\w+$",
      answer: "/login",
      createdAt: new Date("2025-11-14T12:00:00Z"),
      updatedAt: new Date("2025-11-14T12:00:00Z"),
    },
    {
      id: "cmhzelbvt000404jr81fi6toi",
      scenarioId: "cmhze7pwm000104jreuf34n0m",
      title: "What are the credentials you logged into the web server with?",
      placeholder: "username:password",
      validation: "^\\w+:\\w+$",
      answer: "admin,password",
      createdAt: new Date("2025-11-14T12:00:00Z"),
      updatedAt: new Date("2025-11-14T12:00:00Z"),
    },
    {
      id: "cmhzemr3p000504jr0u3u3xli",
      scenarioId: "cmhze7pwm000104jreuf34n0m",
      title:
        "The web server has access to an internal network that cannot be directly accessed from the internet. What is the IP address of the machine on the internal network?",
      placeholder: "192.168.1.xxx",
      validation: "^\\d{1,3}(\\.\\d{1,3}){3}$",
      answer: "192.168.1.100",
      createdAt: new Date("2025-11-14T12:00:00Z"),
      updatedAt: new Date("2025-11-14T12:00:00Z"),
    },
    {
      id: "cmhzenom0000704jr8iuq8ubc",
      scenarioId: "cmhze7pwm000104jreuf34n0m",
      title: "What are the credentials you logged into the OT server with?",
      placeholder: "username:password",
      validation: "^\\w+:\\w+$",
      answer: "admin:password",
      createdAt: new Date("2025-11-14T12:00:00Z"),
      updatedAt: new Date("2025-11-14T12:00:00Z"),
    },
  ],
};

export default function ScenarioPage() {
  return <ScenarioLayout scenario={ScenarioData} />;
}
