import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function Bidders() {
  const qc = useQueryClient();
  const { data: bidders = [] } = useQuery(['bidders'], () =>
    fetch('/api/bidders').then(r => r.json())
  );

  const updatePercentile = useMutation(
    async ({ id, percentile }: { id: string; percentile: number }) =>
      fetch(`/api/bidders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ percentile }),
      }),
    { onSuccess: () => qc.invalidateQueries(['bidders']) }
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Bidder Percentile Entry</h2>
      <table className="border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">#</th>
            <th className="border px-2 py-1">Bidder / Work</th>
            <th className="border px-2 py-1">Address</th>
            <th className="border px-2 py-1">Percentile</th>
          </tr>
        </thead>
        <tbody>
          {bidders.map((b: any, idx) => (
            <tr key={b._id}>
              <td className="border px-2 py-1">{idx + 1}</td>
              <td className="border px-2 py-1">{b.name}</td>
              <td className="border px-2 py-1 max-w-xs truncate">{b.address}</td>
              <td className="border px-2 py-1">
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
    </div>
  );
}