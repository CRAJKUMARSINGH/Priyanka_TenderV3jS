import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function Bids() {
  const qc = useQueryClient();
  const { data: works } = useQuery(['works'], () =>
    fetch('/api/works').then(r => r.json())
  );
  const [selectedWork, setSelectedWork] = useState<string | null>(null);

  const { data: bids = [] } = useQuery(
    ['bids', selectedWork],
    () =>
      fetch(`/api/bids${selectedWork ? `?workId=${selectedWork}` : ''}`).then(r => r.json()),
    { enabled: !!selectedWork }
  );

  const updatePercentile = useMutation(
    async ({ id, percentile }: { id: string; percentile: number }) =>
      fetch(`/api/bids/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ percentile }),
      }),
    { onSuccess: () => qc.invalidateQueries(['bids']) }
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Enter Percentile – Work-wise</h2>
      <select
        value={selectedWork || ''}
        onChange={(e) => setSelectedWork(e.target.value)}
        className="mb-4 border px-2 py-1"
      >
        <option value="">Choose work</option>
        {works?.map((w: any) => (
          <option key={w._id} value={w._id}>
            {w.name} – ₹{w.gScheduleAmount}
          </option>
        ))}
      </select>

      {selectedWork && (
        <table className="border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th>#</th><th>Bidder</th><th>Amount</th><th>Percentile</th>
            </tr>
          </thead>
          <tbody>
            {bids.map((b: any, idx) => (
              <tr key={b._id}>
                <td>{idx + 1}</td>
                <td>{b.bidderName}</td>
                <td>₹{b.amount}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={b.percentile ?? ''}
                    onChange={(e) =>
                      updatePercentile.mutate({
                        id: b._id,
                        percentile: Number(e.target.value),
                      })
                    }
                    className="w-20 text-center"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}