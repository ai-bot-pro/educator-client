import ExpiryTimer from "../Session/ExpiryTimer";

function Header() {
  return (
    <header
      id="header"
      className="w-full flex self-start items-center p-[--app-padding] justify-between"
    >
      <div className="group flex gap-1">
        <span className="rounded-xl p-2 flex place-content-center transition-all"></span>
        <nav className="pointer-events-none flex-row items-center gap-8 text-lg leading-7 hidden group-hover:flex group-hover:pointer-events-auto"></nav>
      </div>
      <ExpiryTimer />
    </header>
  );
}

export default Header;
