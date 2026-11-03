/** Affiche un titre où les mots entourés d'*astérisques* sont mis en valeur (<em>). */
export default function RichTitle({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/g).map((part, index) =>
        part.startsWith('*') && part.endsWith('*') && part.length > 2 ? (
          <em key={index}>{part.slice(1, -1)}</em>
        ) : (
          part
        ),
      )}
    </>
  );
}
