import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { WeightGoalInsight } from "@/modules/onboarding/components/WeightGoalInsight";
import WeightPage from "@/modules/onboarding/pages/WeightPage";

describe("WeightPage — current step", () => {
  it("renders the current-weight heading", () => {
    render(<WeightPage onContinue={vi.fn()} />);
    expect(screen.getByText("What is your weight?")).toBeInTheDocument();
  });

  it("Continue is disabled when input is empty", () => {
    render(<WeightPage onContinue={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
  });

  it("Continue becomes enabled after entering a valid weight", async () => {
    const user = userEvent.setup();
    render(<WeightPage onContinue={vi.fn()} />);

    await user.type(screen.getByRole("textbox", { name: "Your weight in lbs" }), "150");

    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
  });

  it("Continue stays disabled for an out-of-range weight", async () => {
    const user = userEvent.setup();
    render(<WeightPage onContinue={vi.fn()} />);

    await user.type(screen.getByRole("textbox", { name: "Your weight in lbs" }), "999");

    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
  });

  it("switching unit clears the input value", async () => {
    const user = userEvent.setup();
    render(<WeightPage onContinue={vi.fn()} />);

    await user.type(screen.getByRole("textbox", { name: "Your weight in lbs" }), "150");
    await user.click(screen.getByRole("tab", { name: "kg" }));

    expect(screen.getByRole("textbox", { name: "Your weight in kg" })).toHaveValue("");
  });
});

describe("WeightPage — goal step", () => {
  const advanceToGoalStep = async () => {
    const user = userEvent.setup();
    render(<WeightPage onContinue={vi.fn()} />);

    await user.type(screen.getByRole("textbox", { name: "Your weight in lbs" }), "200");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    return user;
  };

  it("changes heading to ask for goal weight", async () => {
    await advanceToGoalStep();
    expect(screen.getByText(/goal/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Goal weight in lbs" })).toBeInTheDocument();
  });

  it("shows the goal insight when a valid goal is entered", async () => {
    const user = await advanceToGoalStep();

    await user.type(screen.getByRole("textbox", { name: "Goal weight in lbs" }), "170");

    expect(screen.getByText(/Lose 15% of your weight/)).toBeInTheDocument();
  });

  it("calls onContinue on the second Continue click", async () => {
    const onContinue = vi.fn();
    const user = userEvent.setup();
    render(<WeightPage onContinue={onContinue} />);

    await user.type(screen.getByRole("textbox", { name: "Your weight in lbs" }), "200");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.type(screen.getByRole("textbox", { name: "Goal weight in lbs" }), "170");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(onContinue).toHaveBeenCalledOnce();
  });

  it("shows 'Maintain your weight' when goal equals current weight", async () => {
    const user = await advanceToGoalStep();

    await user.type(screen.getByRole("textbox", { name: "Goal weight in lbs" }), "200");

    expect(screen.getByText(/Maintain your weight/)).toBeInTheDocument();
  });

  it("shows gain insight when goal exceeds current weight", async () => {
    const user = await advanceToGoalStep();

    // current=200, goal=240 → gain 20%
    await user.type(screen.getByRole("textbox", { name: "Goal weight in lbs" }), "240");

    expect(screen.getByText(/Gain 20% of your weight/)).toBeInTheDocument();
  });

  it("hides the insight when the goal field is empty", async () => {
    await advanceToGoalStep();

    expect(screen.queryByRole("img", { name: "target" })).not.toBeInTheDocument();
  });
});

describe("WeightGoalInsight", () => {
  it("renders the goal text with 'Goal:' prefix", () => {
    render(<WeightGoalInsight goalText="Lose 15% of your weight" />);

    expect(screen.getByText(/Goal: Lose 15% of your weight/)).toBeInTheDocument();
  });

  it("renders the target emoji with accessible label", () => {
    render(<WeightGoalInsight goalText="Maintain your weight" />);

    expect(screen.getByRole("img", { name: "target" })).toBeInTheDocument();
  });

  it("renders the motivational body text", () => {
    render(<WeightGoalInsight goalText="Gain 10% of your weight" />);

    expect(
      screen.getByText(/Even small, steady changes can make a meaningful difference/),
    ).toBeInTheDocument();
  });
});
