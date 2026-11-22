type Props = {
  loading?: boolean;
  error?: string | null;
  empty?: string | null;
};

export function Status({ loading, error, empty }: Props) {
  if (loading) {
    return <p className="status">Loading catalogue…</p>;
  }
  if (error) {
    return (
      <p className="status status-error" role="alert">
        {error}
      </p>
    );
  }
  if (empty) {
    return <p className="status">{empty}</p>;
  }
  return null;
}
