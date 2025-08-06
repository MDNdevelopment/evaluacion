import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import JobData from "@/components/employeeCreation/JobData";
import "@testing-library/jest-dom";
import "@testing-library/jest-dom/vitest";

describe("JobData Component Tests", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render JobData Component", () => {
    render(<JobData register={() => {}} />);
    expect(screen.getByText("Datos laborales")).toBeInTheDocument();
  });
});
