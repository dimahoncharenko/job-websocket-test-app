import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { OnboardingHeader } from "@/modules/onboarding/components/OnboardingHeader";
import { JobStatusProvider } from "@/modules/onboarding/context/JobStatusContext";
import WishPage from "@/modules/onboarding/pages/WishPage";

vi.mock("next/navigation", () => ({
  usePathname: () => "/onboarding/wish",
  useRouter: () => ({ push: vi.fn() }),
}));

describe("WishPage", () => {
  it("renders the heading", () => {
    render(<WishPage onContinue={vi.fn()} />);
    expect(screen.getByText("What is your main wish?")).toBeInTheDocument();
  });

  it("renders all 5 options inside a radiogroup", () => {
    render(<WishPage onContinue={vi.fn()} />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(5);
  });

  it("hides Continue before any selection", () => {
    render(<WishPage onContinue={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Continue" })).not.toBeInTheDocument();
  });

  it("marks the clicked option as checked", async () => {
    const user = userEvent.setup();
    render(<WishPage onContinue={vi.fn()} />);

    await user.click(screen.getByRole("radio", { name: "Sleep better" }));

    expect(screen.getByRole("radio", { name: "Sleep better" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("shows Continue after an option is selected", async () => {
    const user = userEvent.setup();
    render(<WishPage onContinue={vi.fn()} />);

    await user.click(screen.getByRole("radio", { name: "Sleep better" }));

    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
  });

  it("calls onContinue when Continue is clicked", async () => {
    const user = userEvent.setup();
    const onContinue = vi.fn();
    render(<WishPage onContinue={onContinue} />);

    await user.click(screen.getByRole("radio", { name: "Sleep better" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(onContinue).toHaveBeenCalledOnce();
  });

  it("unchecks the previous option when another is selected", async () => {
    const user = userEvent.setup();
    render(<WishPage onContinue={vi.fn()} />);

    await user.click(screen.getByRole("radio", { name: "Sleep better" }));
    await user.click(screen.getByRole("radio", { name: "Move more" }));

    expect(screen.getByRole("radio", { name: "Sleep better" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
    expect(screen.getByRole("radio", { name: "Move more" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });
});

describe("OnboardingHeader on WishPage", () => {
  const renderHeader = () =>
    render(
      <JobStatusProvider>
        <OnboardingHeader />
      </JobStatusProvider>,
    );

  it("shows the onboarding progress bar", () => {
    renderHeader();
    expect(screen.getByRole("progressbar", { name: "Onboarding progress" })).toBeInTheDocument();
  });

  it("progress bar is at 33%", () => {
    renderHeader();
    expect(screen.getByRole("progressbar", { name: "Onboarding progress" })).toHaveAttribute(
      "aria-valuenow",
      "33",
    );
  });

  it("back button is disabled on the first step", () => {
    renderHeader();
    expect(screen.getByRole("button", { name: "Go Back" })).toBeDisabled();
  });
});
