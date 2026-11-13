const paths = {
  book: 'M3 5.5Q7 3.5 12 6Q17 3.8 21 5.5L20.6 19Q16 17.3 12 20Q7.5 17.5 3.4 19Z M12 6L12 20 M6 8.5L9 9 M15 9L18 8.5',
  close: 'M6 5.5Q12 12 18.2 18 M18 5.8Q12 12 5.8 18',
  next: 'M4 12.3Q12 11.7 20 12 M14 6.5L20 12L14.5 18',
  back: 'M20 12Q12 12.4 4 12 M9.5 6.5L4 12L10 18',
};

export default function PaperIcon({ type = 'book' }) {
  return <svg className="paper-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d={paths[type] || paths.book} />
  </svg>;
}
