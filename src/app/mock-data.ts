// Демо-данные для sales-report-bot.
// В реальном проекте этот слой заменяется запросами к БД или API.

export interface Store {
	id: string;
	name: string;
	supervisorId?: string;
	monthlyPlan: number;
	currentRevenue: number;
}

export interface Seller {
	id: string;
	name: string;
	monthlyPlan: number;
	currentRevenue: number;
	shiftsWorked: number;
	storesWorked: string[];
}

export interface Shift {
	id: string;
	sellerId: string;
	storeId: string;
	date: string;
	startTime: string;
	endTime: string;
	revenue: number;
	status: "active" | "ended" | "emergency_closed";
}

export interface MonthlyStats {
	month: string;
	revenue: number;
	shiftsWorked: number;
	plan: number;
}

export interface WorkMaterial {
	id: string;
	title: string;
	category: "regulations" | "materials" | "scripts";
	fileName: string;
	fileSize: string;
	downloadUrl: string;
	roles: Array<"seller" | "supervisor" | "manager">;
}

export const MOCK_STORES: Store[] = [
	{
		id: "store_1",
		name: "ТЦ «Галерея»",
		supervisorId: "sup_1",
		monthlyPlan: 500_000,
		currentRevenue: 320_000,
	},
	{
		id: "store_2",
		name: "ТРК «Планета»",
		supervisorId: "sup_1",
		monthlyPlan: 450_000,
		currentRevenue: 280_000,
	},
	{
		id: "store_3",
		name: "ул. Красная, 105",
		supervisorId: "sup_2",
		monthlyPlan: 600_000,
		currentRevenue: 410_000,
	},
	{
		id: "store_4",
		name: "ТЦ «Северный»",
		supervisorId: "sup_2",
		monthlyPlan: 550_000,
		currentRevenue: 190_000,
	},
];

export const MOCK_SELLERS: Seller[] = [
	{
		id: "seller_1",
		name: "Иванов И. И.",
		monthlyPlan: 300_000,
		currentRevenue: 180_000,
		shiftsWorked: 15,
		storesWorked: ["store_1", "store_2"],
	},
	{
		id: "seller_2",
		name: "Петрова П. П.",
		monthlyPlan: 350_000,
		currentRevenue: 210_000,
		shiftsWorked: 18,
		storesWorked: ["store_2", "store_3"],
	},
	{
		id: "seller_3",
		name: "Сидоров С. С.",
		monthlyPlan: 280_000,
		currentRevenue: 265_000,
		shiftsWorked: 16,
		storesWorked: ["store_3"],
	},
	{
		id: "seller_4",
		name: "Кузнецова А. В.",
		monthlyPlan: 320_000,
		currentRevenue: 190_000,
		shiftsWorked: 14,
		storesWorked: ["store_1", "store_4"],
	},
	{
		id: "seller_5",
		name: "Морозов Д. А.",
		monthlyPlan: 300_000,
		currentRevenue: 305_000,
		shiftsWorked: 17,
		storesWorked: ["store_4"],
	},
];

export const MOCK_SHIFTS: Shift[] = [
	{
		id: "shift_1",
		sellerId: "seller_1",
		storeId: "store_1",
		date: "2026-11-03",
		startTime: "09:00",
		endTime: "18:00",
		revenue: 42_500,
		status: "ended",
	},
	{
		id: "shift_2",
		sellerId: "seller_1",
		storeId: "store_2",
		date: "2026-11-07",
		startTime: "10:00",
		endTime: "19:00",
		revenue: 38_200,
		status: "ended",
	},
	{
		id: "shift_3",
		sellerId: "seller_1",
		storeId: "store_1",
		date: "2026-11-12",
		startTime: "09:00",
		endTime: "18:00",
		revenue: 51_300,
		status: "ended",
	},
	{
		id: "shift_4",
		sellerId: "seller_2",
		storeId: "store_3",
		date: "2026-11-05",
		startTime: "09:00",
		endTime: "18:00",
		revenue: 47_900,
		status: "ended",
	},
	{
		id: "shift_5",
		sellerId: "seller_2",
		storeId: "store_2",
		date: "2026-11-11",
		startTime: "10:00",
		endTime: "19:00",
		revenue: 44_100,
		status: "ended",
	},
];

export const MOCK_MONTHLY_STATS: Record<string, MonthlyStats[]> = {
	seller_1: [
		{ month: "2026-11", revenue: 180_000, shiftsWorked: 7, plan: 300_000 },
		{ month: "2026-10", revenue: 312_000, shiftsWorked: 18, plan: 300_000 },
		{ month: "2026-09", revenue: 287_500, shiftsWorked: 17, plan: 285_000 },
		{ month: "2026-08", revenue: 240_000, shiftsWorked: 15, plan: 280_000 },
	],
	seller_2: [
		{ month: "2026-11", revenue: 210_000, shiftsWorked: 8, plan: 350_000 },
		{ month: "2026-10", revenue: 355_000, shiftsWorked: 19, plan: 350_000 },
		{ month: "2026-09", revenue: 301_000, shiftsWorked: 18, plan: 330_000 },
	],
};

const REGULATIONS: WorkMaterial[] = [
	{
		id: "reg_1",
		title: "Регламент открытия и закрытия смены",
		category: "regulations",
		fileName: "shift-regulations.pdf",
		fileSize: "1.8 MB",
		downloadUrl: "https://example.com/materials/shift-regulations.pdf",
		roles: ["seller", "supervisor", "manager"],
	},
	{
		id: "reg_2",
		title: "Правила сдачи выручки и фотоотчёта",
		category: "regulations",
		fileName: "cash-report-rules.pdf",
		fileSize: "2.4 MB",
		downloadUrl: "https://example.com/materials/cash-report-rules.pdf",
		roles: ["seller", "supervisor"],
	},
	{
		id: "reg_3",
		title: "Чек-лист супервайзера",
		category: "regulations",
		fileName: "supervisor-checklist.pdf",
		fileSize: "900 KB",
		downloadUrl: "https://example.com/materials/supervisor-checklist.pdf",
		roles: ["supervisor", "manager"],
	},
];

const INFO_MATERIALS: WorkMaterial[] = [
	{
		id: "info_1",
		title: "Новая линейка аксессуаров",
		category: "materials",
		fileName: "accessories-lineup.pdf",
		fileSize: "3.1 MB",
		downloadUrl: "https://example.com/materials/accessories-lineup.pdf",
		roles: ["seller", "supervisor", "manager"],
	},
	{
		id: "info_2",
		title: "Условия рассрочки и trade-in",
		category: "materials",
		fileName: "installment-trade-in.pdf",
		fileSize: "1.2 MB",
		downloadUrl: "https://example.com/materials/installment-trade-in.pdf",
		roles: ["seller", "supervisor"],
	},
];

const SCRIPTS: WorkMaterial[] = [
	{
		id: "script_1",
		title: "Скрипт приветствия и выявления потребности",
		category: "scripts",
		fileName: "greeting-script.pdf",
		fileSize: "640 KB",
		downloadUrl: "https://example.com/materials/greeting-script.pdf",
		roles: ["seller"],
	},
	{
		id: "script_2",
		title: "Скрипт работы с возражениями по цене",
		category: "scripts",
		fileName: "objections-price.pdf",
		fileSize: "780 KB",
		downloadUrl: "https://example.com/materials/objections-price.pdf",
		roles: ["seller", "supervisor"],
	},
	{
		id: "script_3",
		title: "Скрипт передачи смены",
		category: "scripts",
		fileName: "handover-script.pdf",
		fileSize: "420 KB",
		downloadUrl: "https://example.com/materials/handover-script.pdf",
		roles: ["seller", "supervisor", "manager"],
	},
];

export const MOCK_SELLER_WORK_MATERIALS = [...REGULATIONS, ...INFO_MATERIALS, ...SCRIPTS].filter(
	(material) => material.roles.includes("seller"),
);
export const MOCK_SUPERVISOR_WORK_MATERIALS = [...REGULATIONS, ...INFO_MATERIALS, ...SCRIPTS].filter(
	(material) => material.roles.includes("supervisor"),
);
export const MOCK_MANAGER_WORK_MATERIALS = [...REGULATIONS, ...INFO_MATERIALS, ...SCRIPTS].filter(
	(material) => material.roles.includes("manager"),
);

export const getSellerById = (id: string): Seller | undefined =>
	MOCK_SELLERS.find((seller) => seller.id === id);

export const getStoreById = (id: string): Store | undefined =>
	MOCK_STORES.find((store) => store.id === id);

export const getShiftsForSeller = (sellerId: string): Shift[] =>
	MOCK_SHIFTS.filter((shift) => shift.sellerId === sellerId);

export const getMonthlyStatsForSeller = (sellerId: string): MonthlyStats[] =>
	MOCK_MONTHLY_STATS[sellerId] ?? [];

export const getAllMaterialsForRole = (role: "seller" | "supervisor" | "manager"): WorkMaterial[] => {
	if (role === "seller") return MOCK_SELLER_WORK_MATERIALS;
	if (role === "supervisor") return MOCK_SUPERVISOR_WORK_MATERIALS;
	return MOCK_MANAGER_WORK_MATERIALS;
};

export const getMaterialsByCategoryAndRole = (
	category: string,
	role: "seller" | "supervisor" | "manager",
): WorkMaterial[] =>
	getAllMaterialsForRole(role).filter((material) => material.category === category);
