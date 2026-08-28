type NotesInputProps = { value: string; onChange: (value: string) => void; maxLength: number }

export function NotesInput({ value, onChange, maxLength }: NotesInputProps) {
  const isShort = value.length > 0 && value.trim().length < 50
  const isLong = value.length > maxLength
  return <div className="notes-input"><label htmlFor="study-notes">Class notes</label><textarea id="study-notes" value={value} maxLength={maxLength + 1} onChange={(event) => onChange(event.target.value)} placeholder="Paste your class notes here..." aria-describedby="notes-help notes-count" aria-invalid={isShort || isLong} /><div className="notes-meta"><span id="notes-help" className={isShort || isLong ? 'notes-error' : ''}>{isShort ? 'Add at least 50 characters.' : isLong ? 'Shorten your notes to continue.' : 'Use your own notes for the most useful questions.'}</span><span id="notes-count">{value.length.toLocaleString()} / {maxLength.toLocaleString()}</span></div></div>
}