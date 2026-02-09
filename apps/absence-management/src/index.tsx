import { useAbsences, useCreateAbsence } from "data-access";
import { PrimaryButton } from "ui";
import { useState } from "react";

export function App() {
  const { data, isLoading } = useAbsences();
  const createMutation = useCreateAbsence();
  const [date, setDate] = useState("");

  if (isLoading) return <div>Loading absences...</div>;

  const handleSubmit = () => {
    createMutation.mutate({ date, reason: "Holiday" });
  };

  return (
    <div>
      <h2>Absence Management</h2>
      <input type="date" onChange={(e) => setDate(e.target.value)} />
      <PrimaryButton onClick={handleSubmit}>Request Leave</PrimaryButton>

      <ul>
        {data?.absences.map((item: any) => (
          <li key={item.id}>
            {item.date} - {item.reason}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
