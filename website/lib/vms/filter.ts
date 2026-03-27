export type ProxmoxVM = { vmid: number; name: string; template: boolean };

export function getFilteredVMs(
  proxmoxVMs: ProxmoxVM[],
  searchValue: string,
  templatesOnly: boolean,
): ProxmoxVM[] {
  const search = searchValue.toLowerCase().trim();
  const parts = search.length
    ? search.split(/\s+/).filter((p: string) => p.length > 2)
    : [];

  const filtered = proxmoxVMs.filter((vm) => {
    if (templatesOnly && !vm.template) return false;
    if (!search) return true;
    const name = vm.name.toLowerCase();
    const id = vm.vmid.toString();

    if (parts.length > 0) {
      return parts.some((p: string) => name.includes(p) || id.includes(p));
    }

    return name.includes(search) || id.includes(search);
  });

  filtered.sort((a, b) => a.vmid - b.vmid);
  return filtered;
}
