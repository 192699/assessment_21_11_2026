import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EnquiryForm } from "./EnquiryForm";

describe("EnquiryForm", () => {
  it("blocks submit until the message is long enough", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <EnquiryForm productId="11" submitting={false} error={null} onSubmit={onSubmit} />
    );

    await user.type(screen.getByLabelText("Name"), "Alex Buyer");
    await user.type(screen.getByLabelText("Email"), "alex@example.com");
    await user.type(screen.getByLabelText("Message"), "Hello");
    await user.click(screen.getByRole("button", { name: "Enquire" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("at least 10 characters");
  });

  it("submits contact details for a product enquiry", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <EnquiryForm productId="11" submitting={false} error={null} onSubmit={onSubmit} />
    );

    await user.type(screen.getByLabelText("Name"), "Alex Buyer");
    await user.type(screen.getByLabelText("Email"), "alex@example.com");
    await user.type(
      screen.getByLabelText("Message"),
      "Please quote ten units for April."
    );
    await user.click(screen.getByRole("button", { name: "Enquire" }));

    expect(onSubmit).toHaveBeenCalledWith({
      productId: "11",
      name: "Alex Buyer",
      email: "alex@example.com",
      phone: undefined,
      message: "Please quote ten units for April.",
    });
  });
});
