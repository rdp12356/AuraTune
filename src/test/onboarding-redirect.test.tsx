import { fireEvent, render, screen } from "@testing-library/react";
import { vi, describe, it, beforeEach, expect } from "vitest";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

import OnboardingScreen from "@/pages/OnboardingScreen";

describe("Onboarding start session redirect", () => {
  beforeEach(() => {
    localStorage.clear();
    navigateMock.mockReset();
  });

  it("sets onboarding_complete and redirects to root when Start your first session is clicked", async () => {
    render(<OnboardingScreen />);

    fireEvent.click(screen.getByRole("button", { name: "2 hours" }));
    fireEvent.click(screen.getByRole("button", { name: /See your results/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Continue$/i }));
    fireEvent.click(screen.getByRole("button", { name: /But what if/i }));
    fireEvent.click(screen.getByRole("button", { name: /Show me how/i }));
    fireEvent.click(screen.getByRole("button", { name: /I'm ready/i }));
    fireEvent.click(screen.getByRole("button", { name: /Start your first session/i }));

    expect(localStorage.getItem("onboarding_complete")).toBe("true");
    expect(navigateMock).toHaveBeenCalledWith("/");
  });
});
