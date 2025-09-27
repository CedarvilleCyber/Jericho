// lib/access.ts
export type AccessRule = { pools?: string[]; vms?: Array<{ node: string; vmid: number }> };


// Map userId or role → allowed resources
export const accessByUser: Record<string, AccessRule> = {
u1: { pools: ["scenario-web-lab", "scenario-ad-lab"] }, // Admin
u2: { pools: ["scenario-web-lab"] }, // Student
};


export function userCanAccessPool(userId: string, pool: string) {
const r = accessByUser[userId];
return !!r && (!!r.pools?.includes(pool));
}


export function userCanAccessVm(userId: string, node: string, vmid: number) {
const r = accessByUser[userId];
if (!r) return false;
if (r.vms?.some(v => v.node === node && v.vmid === vmid)) return true;
// Allow via pool membership check later (when issuing console from a pool context)
return false;
}