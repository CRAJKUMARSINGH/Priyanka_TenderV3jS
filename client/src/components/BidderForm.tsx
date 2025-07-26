// client/src/components/BidderForm.tsx
const handlePaste = (e) => {
  const pasted = e.clipboardData.getData('text');
  if (pasted.includes(',')) {
    const [name, address] = pasted.split(',', 2).map(s => s.trim());
    setForm({ ...form, name, address });
    e.preventDefault();
  }
};