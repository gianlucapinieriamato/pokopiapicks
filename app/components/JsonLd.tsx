export default function JsonLd({ data }: { data: object }) {
  return (
    <script type="application/ld+json">
      {JSON.stringify(data)}
    </script>
  );
}
