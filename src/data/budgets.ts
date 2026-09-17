export const budgetOptions = {
  ph: [
    { value: 'ph-under-50k', label: 'Under ₱50k' },
    { value: 'ph-50k-100k', label: '₱50k – ₱100k' },
    { value: 'ph-100k-400k', label: '₱100k – ₱400k' },
    { value: 'ph-over-400k', label: 'Over ₱400k' },
    { value: 'ph-unsure', label: 'Not sure yet — help me scope it' },
  ],
  international: [
    { value: 'intl-under-2500', label: 'Under $2,500' },
    { value: 'intl-2500-6000', label: '$2,500 – $6,000' },
    { value: 'intl-6000-15000', label: '$6,000 – $15,000' },
    { value: 'intl-over-15000', label: 'Over $15,000' },
    { value: 'intl-unsure', label: 'Not sure yet — help me scope it' },
  ],
}
export function budgetLabel(value: string | null) {
  const option = [...budgetOptions.ph, ...budgetOptions.international].find(item => item.value === value)
  return option ? `${value?.startsWith('ph-') ? 'PHP' : 'USD'} · ${option.label}` : value || 'Not specified'
}
