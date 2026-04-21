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

function clearStorage(storage: Storage) {
  if (typeof storage.clear === "function") {
    storage.clear();
    return;
  }

  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key) keys.push(key);
  }
  keys.forEach((key) => storage.removeItem(key));
}

describe("Onboarding start session redirect", () => {
  beforeEach(() => {
    clearStorage(window.localStorage);
    navigateMock.mockReset();
  });

  it("sets onboarding_complete and redirects to root when Start your first session is clicked", async () => {
    render(<OnboardingScreen />);

    fireEvent.click(screen.getByRole("button", { name: "2 hours" }));
    fireEvent.click(await screen.findByRole("button", { name: /See your results/i }));
    fireEvent.click(await screen.findByRole("button", { name: /^Continue$/i }));
    fireEvent.click(await screen.findByRole("button", { name: /But what if/i }));
    fireEvent.click(await screen.findByRole("button", { name: /Show me how/i }));
    fireEvent.click(await screen.findByRole("button", { name: /I'm ready/i }));
    fireEvent.click(await screen.findByRole("button", { name: /Start your first session/i }));

    expect(localStorage.getItem("onboarding_complete")).toBe("true");
    expect(navigateMock).toHaveBeenCalledWith("/");
  });
});
