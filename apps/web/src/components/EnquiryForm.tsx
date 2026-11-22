import { FormEvent, useState } from "react";
import type { EnquiryPayload } from "../types";

type Props = {
  productId: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (payload: EnquiryPayload) => Promise<void>;
};

export function EnquiryForm({ productId, submitting, error, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (message.trim().length < 10) {
      setLocalError("Please include a short note (at least 10 characters).");
      return;
    }
    setLocalError(null);
    await onSubmit({
      productId,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      message: message.trim(),
    });
  }

  return (
    <form className="enquiry-form" onSubmit={handleSubmit}>
      <h2>Enquire about this product</h2>
      <p className="lede">
        Sales will receive your details by email. This is not an order.
      </p>
      <label>
        Name
        <input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} />
      </label>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label>
        Phone <span className="optional">(optional)</span>
        <input value={phone} onChange={(event) => setPhone(event.target.value)} />
      </label>
      <label>
        Message
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
          rows={5}
        />
      </label>
      {(localError || error) && (
        <p className="status status-error" role="alert">
          {localError ?? error}
        </p>
      )}
      <button type="submit" disabled={submitting}>
        {submitting ? "Sending…" : "Enquire"}
      </button>
    </form>
  );
}
