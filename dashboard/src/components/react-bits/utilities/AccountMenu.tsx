import { useState } from "react";

export interface AccountMenuAccount {
  id: string;
  name: string;
  email?: string;
}
export interface AccountMenuProps {
  accounts: AccountMenuAccount[];
  activeId: string;
  onSelect: (account: AccountMenuAccount) => void;
  className?: string;
}

export function AccountMenu({
  accounts,
  activeId,
  onSelect,
  className = "",
}: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const active = accounts.find((account) => account.id === activeId);
  return (
    <div className={className}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {active?.name ?? "Local profile"}
      </button>
      {open && (
        <div role="menu">
          {accounts.map((account) => (
            <div key={account.id}>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={account.id === activeId}
                onClick={() => {
                  onSelect(account);
                  setOpen(false);
                }}
              >
                {account.name}
                {account.email ? ` · ${account.email}` : ""}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default AccountMenu;
