export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-circle"></span>
            <span>Circle Calendar</span>
          </div>
          <p className="footer-text">
            Helping Muslim families understand the beauty of both calendar systems.
          </p>
          <p className="footer-copyright">
            &copy; {currentYear} Circle Calendar. Made with care for the ummah.
          </p>
        </div>
      </div>
    </footer>
  );
}
