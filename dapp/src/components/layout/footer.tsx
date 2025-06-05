export function Footer() {
  return (
    <footer className="bg-background border-t mt-auto">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Barter NFT.
          </p>
          <p className="text-sm text-muted-foreground mt-2 md:mt-0">
            Designed with ❤️ for digital collectors worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
