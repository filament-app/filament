// Zero React state. Zero effects. Zero event handlers.
// Pure server-rendered textarea. If this also breaks, bug is NOT in React.
export default function TestPad() {
  return (
    <div style={{ padding: '24px', maxWidth: '600px' }}>
      <p style={{ fontFamily: 'monospace', fontSize: '13px', color: '#888', marginBottom: '12px' }}>
        TEST PAGE — type a full sentence below without losing focus
      </p>
      <textarea
        rows={6}
        placeholder="Type here: The quick brown fox..."
        style={{
          width: '100%',
          fontSize: '16px',
          padding: '12px',
          border: '2px solid #0D0D0D',
          fontFamily: 'monospace',
          display: 'block',
          boxSizing: 'border-box',
          outline: 'none',
        }}
      />
    </div>
  )
}
