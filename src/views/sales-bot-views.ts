import type { TelegramClient } from "@bot-machine/telegram-client";
import type { InlineKeyboardMarkup, Message } from "@bot-machine/telegram-client";
import { MessageBuilder } from "../infra/message-builder";
import { 
  getSellerById, 
  getShiftsForSeller, 
  getMonthlyStatsForSeller, 
  getStoreById,
  getMaterialsByCategoryAndRole,
  getAllMaterialsForRole,
  MOCK_SELLER_WORK_MATERIALS,
  MOCK_SUPERVISOR_WORK_MATERIALS,
  MOCK_MANAGER_WORK_MATERIALS,
  MOCK_SELLERS,
  MOCK_STORES
} from "../app/mock-data";
import type { Seller, MonthlyStats, WorkMaterial } from "../app/mock-data";



// --- Generic Helper ---
async function sendOrEdit(client: TelegramClient, chatId: number, text: string, keyboard: InlineKeyboardMarkup, messageId?: number): Promise<Message> {
    const payload = { chat_id: chatId, text, reply_markup: keyboard, parse_mode: "MarkdownV2" as const };
    if (messageId) {
        const result = await client.editMessageText({ ...payload, message_id: messageId });
        // editMessageText can return true, so we construct a mock Message for consistency
        return typeof result === 'boolean' ? { message_id: messageId, chat: { id: chatId, type: "private" }, date: Date.now() } : result;
    } else {
        return await client.sendMessage(payload);
    }
}

// --- Role-Specific Menus ---

export const showSellerMenu = async (client: TelegramClient, chatId: number, messageId?: number) => {
    const text = new MessageBuilder().addText("Меню Продавца-Консультанта. Что вы хотите сделать?").build();
    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "🚀 Начать смену", callback_data: "seller_start_shift" }],
            [{ text: "📊 Мои показатели", callback_data: "seller_my_stats" }],
            [{ text: "📚 Все для работы", callback_data: "seller_work_materials" }],
        ],
    };
    return sendOrEdit(client, chatId, text, keyboard, messageId);
};

export const showSupervisorMenu = async (client: TelegramClient, chatId: number, messageId?: number) => {
    const text = new MessageBuilder().addText("Меню Супервайзера. Выберите раздел для просмотра.").build();
    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "📈 Показатели торговых точек", callback_data: "sup_store_stats" }],
            [{ text: "👥 Показатели продавцов", callback_data: "sup_seller_stats" }],
            [{ text: "📚 Все для работы", callback_data: "sup_work_materials" }],
        ],
    };
    return sendOrEdit(client, chatId, text, keyboard, messageId);
};

export const showManagerMenu = async (client: TelegramClient, chatId: number, messageId?: number) => {
    const text = new MessageBuilder().addText("Меню Руководителя. Выберите раздел для просмотра.").build();
    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "📈 Показатели торговых точек", callback_data: "man_store_stats" }],
            [{ text: "👥 Показатели продавцов", callback_data: "man_seller_stats" }],
        ],
    };
    return sendOrEdit(client, chatId, text, keyboard, messageId);
};

// --- Seller Flow Screens ---

export const showStoreSelection = async (client: TelegramClient, chatId: number, messageId?: number) => {
    const text = new MessageBuilder().addText("Выберите вашу торговую точку:").build();
    const storeButtons = MOCK_STORES.map(store => ([{ text: store.name, callback_data: `select_store_${store.id}` }]));    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            ...storeButtons,
            [{ text: "⬅️ Назад", callback_data: "back_to_seller_menu" }],
        ],
    };
    return sendOrEdit(client, chatId, text, keyboard, messageId);
};

export const showActiveShiftMenu = async (client: TelegramClient, chatId: number, storeName: string, messageId?: number) => {
    const text = new MessageBuilder()
        .addText("✅ Смена в ")
        .addBold(storeName)
        .addText(" начата. Хорошей работы!")
        .build();
    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "📋 Закончить смену и сдать отчет", callback_data: "seller_end_shift" }],
            [{ text: "🏃 Экстренное закрытие", callback_data: "seller_emergency_close" }],
        ],
    };
    return sendOrEdit(client, chatId, text, keyboard, messageId);
};

// Helper function to simulate saving with progress indicator
async function simulateSave(client: TelegramClient, chatId: number, messageId: number | undefined, savingText: string, completionText: string) {
    // Show saving message
    const progressMessage = await sendOrEdit(client, chatId, savingText, { inline_keyboard: [] }, messageId);
    
    // Simulate a delay to represent processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update message to show completion
    return await sendOrEdit(client, chatId, completionText, { inline_keyboard: [] }, progressMessage.message_id);
}

export const askForRevenue = async (client: TelegramClient, chatId: number, messageId?: number) => {
    const text = new MessageBuilder()
        .addText("Пожалуйста, введите ")
        .addBold("общую сумму выручки")
        .addText(" за смену (только цифры):")
        .build();
    return sendOrEdit(client, chatId, text, { inline_keyboard: [] }, messageId);
};

export const askForCashAmount = async (client: TelegramClient, chatId: number, messageId?: number) => {
    const text = new MessageBuilder().addText("Введите сумму ").addBold("наличных").addText(":").build();
    return sendOrEdit(client, chatId, text, { inline_keyboard: [] }, messageId);
};

export const askForCardAmount = async (client: TelegramClient, chatId: number, messageId?: number) => {
    const text = new MessageBuilder().addText("Введите сумму ").addBold("безнала").addText(" (оплата картой):").build();
    return sendOrEdit(client, chatId, text, { inline_keyboard: [] }, messageId);
};

export const askForQrAmount = async (client: TelegramClient, chatId: number, messageId?: number) => {
    const text = new MessageBuilder().addText("Введите сумму по ").addBold("QR-коду").addText(":").build();
    return sendOrEdit(client, chatId, text, { inline_keyboard: [] }, messageId);
};

export const askForTransferAmount = async (client: TelegramClient, chatId: number, messageId?: number) => {
    const text = new MessageBuilder().addText("Введите сумму ").addBold("переводом").addText(":").build();
    return sendOrEdit(client, chatId, text, { inline_keyboard: [] }, messageId);
};

export const askForReturnsAmount = async (client: TelegramClient, chatId: number, messageId?: number) => {
    const text = new MessageBuilder().addText("Введите сумму ").addBold("возвратов").addText(":").build();
    return sendOrEdit(client, chatId, text, { inline_keyboard: [] }, messageId);
};

export const askForPhotos = async (client: TelegramClient, chatId: number, messageId: number | undefined, uploadedCount: number) => {
    const photoPrompts = [
        "1/4: Фото подписи на конверте с выручкой",
        "2/4: Фото сводных чеков",
        "3/4: Фото конверта, в котором все лежит",
        "4/4: Фото запечатанного конверта",
    ];

    if (uploadedCount >= photoPrompts.length) {
        return await showReportReview(client, chatId, messageId!, {}); // Pass mock data
    } else {
        const text = new MessageBuilder()
            .addText(`Теперь, пожалуйста, прикрепите фото. (${uploadedCount + 1}/4)`)
            .newLine(2)
            .addBold(photoPrompts[uploadedCount] ?? "")
            .build();
        return sendOrEdit(client, chatId, text, { inline_keyboard: [] }, messageId);
    }
};

export const showReportReview = async (client: TelegramClient, chatId: number, messageId: number | undefined, reportData: any) => {
    // Calculate total revenue (according to business logic: revenue = cash + card + qr + transfer - returns)
    const cash = Number(reportData.cash) || 0;
    const card = Number(reportData.card) || 0;
    const qr = Number(reportData.qr) || 0;
    const transfer = Number(reportData.transfer) || 0;
    const returns = Number(reportData.returns) || 0;
    
    const totalRevenue = cash + card + qr + transfer - returns;
    
        const builder = new MessageBuilder()
        .addTitle("📋 Подтверждение отчета")
        .newLine(2)
        .addBold("Детализация по видам оплаты:")
        .newLine(2)
        .addListItem(`💳 Безналичный расчет: ${card.toLocaleString('ru-RU')} руб.`)
        .newLine()
        .addListItem(`💵 Наличные: ${cash.toLocaleString('ru-RU')} руб.`)
        .newLine()
        .addListItem(`📱 Оплата по QR-коду: ${qr.toLocaleString('ru-RU')} руб.`)
        .newLine()
        .addListItem(`🔄 Переводом: ${transfer.toLocaleString('ru-RU')} руб.`)
        .newLine(2)
        .addBold("Возвраты:")
        .newLine(2)
        .addListItem(`↩️ Возвраты: ${returns.toLocaleString('ru-RU')} руб.`)
        .newLine(2)
        .addBold(`💰 Общая выручка: ${totalRevenue.toLocaleString('ru-RU')} руб.`)
        .newLine(2)
        .addText("📸 Приложено 4 фото-подтверждения:")
        .newLine(2)
        .addText("• Фото подписи на конверте")
        .newLine()
        .addText("• Фото сводных чеков")
        .newLine()
        .addText("• Фото конверта с содержимым") 
        .newLine()
        .addText("• Фoto запечатанного конверта")
        .newLine(2)
        .addText("Все верно?");

    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "✅ Подтвердить и завершить", callback_data: "report_confirm" }],
            [{ text: "✏️ Редактировать отчет", callback_data: "report_edit" }],
        ],
    };
    return sendOrEdit(client, chatId, builder.build(), keyboard, messageId);
};

export const showShiftEndMessage = async (client: TelegramClient, chatId: number, messageId?: number) => {
    // First, show a "saving" message with progress indicator
    const progressText = new MessageBuilder().addText("⏳ Сохранение отчета...").build();
    const progressMessage = await sendOrEdit(client, chatId, progressText, { inline_keyboard: [] }, messageId);
    
    // Simulate saving process with a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update message to show completion
    const completionText = new MessageBuilder().addText("✅ Отчет успешно сохранен! Смена завершена. Спасибо за работу, хорошего отдыха!").build();
    const sentMessage = await sendOrEdit(client, chatId, completionText, { inline_keyboard: [] }, progressMessage.message_id);
    
    // Show main menu again after a delay
    setTimeout(() => showSellerMenu(client, chatId), 2000);
    return sentMessage;
};

export const showEmergencyClosePrompt = async (client: TelegramClient, chatId: number, messageId?: number) => {
    const text = new MessageBuilder()
        .addText("🏃 Экстренное закрытие. Введите ")
        .addBold("актуальный показатель выручки")
        .addText(" на момент ухода:")
        .build();
    return sendOrEdit(client, chatId, text, { inline_keyboard: [] }, messageId);
};

// --- Seller Stats ---
export const showSellerMyStats = async (client: TelegramClient, chatId: number, messageId?: number) => {
    // For demonstration purposes, we'll use a hardcoded seller ID
    // In a real implementation, we would get the seller ID from the user session
    const sellerId = "seller_1";
    const seller: Seller | undefined = getSellerById(sellerId);
    
    if (!seller) {
        const errorText = new MessageBuilder()
            .addText("Ошибка: Не удалось получить данные продавца")
            .build();
        const keyboard: InlineKeyboardMarkup = {
            inline_keyboard: [
                [{ text: "⬅️ Назад", callback_data: "back_to_seller_menu" }],
            ],
        };
        return sendOrEdit(client, chatId, errorText, keyboard, messageId);
    }

    // Get shifts for this seller
    const shifts = getShiftsForSeller(sellerId);
    
    const builder = new MessageBuilder()
        .addTitle(`📊 Ваши показатели за текущий месяц`)
        .newLine(2)
        .addListItem(`Дата: ${new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}`)
        .addListItem(`Смен отработано: ${shifts.length}`)
        .newLine(2)
        .addBold("Выполнение плана:")
        .newLine()
        .addRawText(createPlanCompletionText(seller.currentRevenue, seller.monthlyPlan))
        .newLine(2)
        .addText("\(Данные обновляются ежедневно\)");

    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "📅 Архив по месяцам", callback_data: "seller_monthly_archive" }],
            [{ text: "⬅️ Назад", callback_data: "back_to_seller_menu" }],
        ],
    };
    return sendOrEdit(client, chatId, builder.build(), keyboard, messageId);
};

// Helper function to create a visual progress bar
function createProgressBar(percentage: number): string {
    const width = 12;
    const filledBlocks = Math.min(width, Math.floor(percentage / (100/width)));
    const emptyBlocks = width - filledBlocks;
    return `【${'█'.repeat(filledBlocks)}${'░'.repeat(emptyBlocks)}】 ${percentage.toFixed(1)}%`;
}

// Helper function for displaying plan completion with visual indicators
function createPlanCompletionText(current: number | undefined, plan: number | undefined): string {
    // Handle undefined values
    const currentVal = current ?? 0;
    const planVal = plan ?? 0;
    
    const percentage = planVal > 0 ? (currentVal / planVal * 100) : 0;
    const remaining = planVal - currentVal;
    
    return new MessageBuilder()
        .addText(`Выручка: ${currentVal.toLocaleString('ru-RU')} руб. из ${planVal.toLocaleString('ru-RU')} руб.`)
        .newLine()
        .addText(`Прогресс: ${createProgressBar(percentage)}`)
        .newLine()
        .addText(remaining > 0 
            ? `Осталось: ${Math.max(0, remaining).toLocaleString('ru-RU')} руб.` 
            : '✅ План выполнен!')
        .build();
}

// --- Seller Monthly Archive ---
export const showSellerMonthlyArchive = async (client: TelegramClient, chatId: number, messageId?: number) => {
    // For demonstration purposes, we'll use a hardcoded seller ID
    const sellerId = "seller_1";
    const monthlyStats = getMonthlyStatsForSeller(sellerId);
    
    const builder = new MessageBuilder()
        .addTitle("📅 Архив по месяцам")
        .newLine(2);

    if (monthlyStats.length === 0) {
        builder.addText("Архивные данные отсутствуют");
    } else {
        monthlyStats.forEach((monthData: MonthlyStats) => {
            const monthName = new Date(monthData.month + "-01").toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
            const remaining = monthData.plan - monthData.revenue;
            const percentage = (monthData.revenue / monthData.plan * 100).toFixed(1);
            
            builder
                .addBold(`${monthName.toUpperCase()}`)
                .newLine()
                .addListItem(`Наработано: ${monthData.revenue.toLocaleString('ru-RU')} руб.`)
                .addListItem(`План: ${monthData.plan.toLocaleString('ru-RU')} руб.`)
                .addListItem(`Остаток до плана: ${Math.max(0, remaining).toLocaleString('ru-RU')} руб. (${percentage}%)`)
                .addText(`Прогресс: ${createProgressBar(parseFloat(percentage))}`)
                .newLine(2);
        });
    }

    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "⬅️ Назад", callback_data: "seller_my_stats" }],
        ],
    };
    return sendOrEdit(client, chatId, builder.build(), keyboard, messageId);
};

// --- Supervisor/Manager Stats ---
export const showSupervisorStoreStats = async (client: TelegramClient, chatId: number, messageId?: number) => {
    // For this demo, we'll show all stores
    // In a real implementation, we would only show stores assigned to this supervisor
    const allStores = MOCK_STORES;
    
    const builder = new MessageBuilder()
        .addTitle("📈 Показатели торговых точек")
        .newLine(2);
    
    allStores.forEach(store => {
        builder
            .addBold(store.name)
            .newLine()
            .addRawText(createPlanCompletionText(store.currentRevenue, store.monthlyPlan))
            .newLine(2);
    });

    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "⬅️ Назад", callback_data: "back_to_supervisor_menu" }],
        ],
    };
    return sendOrEdit(client, chatId, builder.build(), keyboard, messageId);
};

export const showSupervisorSellerStats = async (client: TelegramClient, chatId: number, messageId?: number) => {
    // For this demo, we'll show all sellers
    // In a real implementation, we would only show sellers under this supervisor's purview
    const allSellers = MOCK_SELLERS;
    
    const builder = new MessageBuilder()
        .addTitle("👥 Показатели продавцов")
        .newLine(2);
    
    allSellers.forEach(seller => {
        builder
            .addBold(seller.name)
            .newLine()
            .addRawText(createPlanCompletionText(seller.currentRevenue, seller.monthlyPlan))
            .newLine(2);
    });

    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "⬅️ Назад", callback_data: "back_to_supervisor_menu" }],
        ],
    };
    return sendOrEdit(client, chatId, builder.build(), keyboard, messageId);
};

export const showManagerStoreStats = async (client: TelegramClient, chatId: number, messageId?: number) => {
    const allStores = MOCK_STORES;
    
    // Calculate totals
    const totalPlan = allStores.reduce((sum, store) => sum + store.monthlyPlan, 0);
    const totalRevenue = allStores.reduce((sum, store) => sum + store.currentRevenue, 0);
    
    const builder = new MessageBuilder()
        .addTitle("📈 Показатели всех торговых точек")
        .newLine(2)
        .addBold("Общий итог:")
        .newLine()
        .addRawText(createPlanCompletionText(totalRevenue, totalPlan))
        .newLine(2)
        .addBold("Детализация по точкам:").newLine();
    
    allStores.forEach(store => {
        builder
            .addBold(`• ${store.name}`)
            .newLine()
            .addRawText(createPlanCompletionText(store.currentRevenue, store.monthlyPlan))
            .newLine();
    });

    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "⬅️ Назад", callback_data: "back_to_manager_menu" }],
        ],
    };
    return sendOrEdit(client, chatId, builder.build(), keyboard, messageId);
};

export const showManagerSellerStats = async (client: TelegramClient, chatId: number, messageId?: number) => {
    const allSellers = MOCK_SELLERS;
    
    // Calculate totals
    const totalPlan = allSellers.reduce((sum, seller) => sum + seller.monthlyPlan, 0);
    const totalRevenue = allSellers.reduce((sum, seller) => sum + seller.currentRevenue, 0);
    
    const builder = new MessageBuilder()
        .addTitle("👥 Показатели всех продавцов")
        .newLine(2)
        .addBold("Общий итог:")
        .newLine()
        .addRawText(createPlanCompletionText(totalRevenue, totalPlan))
        .newLine(2)
        .addBold("Детализация по продавцам:").newLine();
    
    allSellers.forEach(seller => {
        builder
            .addBold(`• ${seller.name}`)
            .newLine()
            .addRawText(createPlanCompletionText(seller.currentRevenue, seller.monthlyPlan))
            .newLine();
    });

    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "⬅️ Назад", callback_data: "back_to_manager_menu" }],
        ],
    };
    return sendOrEdit(client, chatId, builder.build(), keyboard, messageId);
};

// --- Placeholder Screens ---

// --- Report Form ---
export const showReportForm = async (client: TelegramClient, chatId: number, messageId: number | undefined, reportData: any, editingField?: string) => {
    // Ensure reportData is not null or undefined
    const safeReportData = reportData || {};
    
    // Status indicators
    const cashStatus = (safeReportData.cash !== undefined && safeReportData.cash !== '') ? '✅' : '☑️';
    const cardStatus = (safeReportData.card !== undefined && safeReportData.card !== '') ? '✅' : '☑️';
    const qrStatus = (safeReportData.qr !== undefined && safeReportData.qr !== '') ? '✅' : '☑️';
    const transferStatus = (safeReportData.transfer !== undefined && safeReportData.transfer !== '') ? '✅' : '☑️';
    const returnsStatus = (safeReportData.returns !== undefined && safeReportData.returns !== '') ? '✅' : '☑️';

    // Format values or show placeholder
    const cashValue = (safeReportData.cash !== undefined && safeReportData.cash !== '') ? 
        `${Number(safeReportData.cash).toLocaleString('ru-RU')} руб.` : '...';
    const cardValue = (safeReportData.card !== undefined && safeReportData.card !== '') ? 
        `${Number(safeReportData.card).toLocaleString('ru-RU')} руб.` : '...';
    const qrValue = (safeReportData.qr !== undefined && safeReportData.qr !== '') ? 
        `${Number(safeReportData.qr).toLocaleString('ru-RU')} руб.` : '...';
    const transferValue = (safeReportData.transfer !== undefined && safeReportData.transfer !== '') ? 
        `${Number(safeReportData.transfer).toLocaleString('ru-RU')} руб.` : '...';
    const returnsValue = (safeReportData.returns !== undefined && safeReportData.returns !== '') ? 
        `${Number(safeReportData.returns).toLocaleString('ru-RU')} руб.` : '...';

    // Calculate total if all values are present
    const allFieldsFilled = cashValue !== '...' && cardValue !== '...' && 
                           qrValue !== '...' && transferValue !== '...' && returnsValue !== '...';
    
    let totalRevenueText = '...';
    if (allFieldsFilled) {
        const cash = Number(safeReportData.cash) || 0;
        const card = Number(safeReportData.card) || 0;
        const qr = Number(safeReportData.qr) || 0;
        const transfer = Number(safeReportData.transfer) || 0;
        const returns = Number(safeReportData.returns) || 0;
        
        const totalRevenue = cash + card + qr + transfer - returns;
        totalRevenueText = `${totalRevenue.toLocaleString('ru-RU')} руб.`;
    }

    // Add special instruction if a field is being edited
    let fieldLabel = "";
    let fieldIcon = "";
    if (editingField) {
        if (editingField === "cash") {
            fieldLabel = "наличные";
            fieldIcon = "💵";
        }
        else if (editingField === "card") {
            fieldLabel = "безналичный расчет";
            fieldIcon = "💳";
        }
        else if (editingField === "qr") {
            fieldLabel = "оплату по QR-коду";
            fieldIcon = "📱";
        }
        else if (editingField === "transfer") {
            fieldLabel = "переводом";
            fieldIcon = "🔄";
        }
        else if (editingField === "returns") {
            fieldLabel = "возвраты";
            fieldIcon = "↩️";
        }
    }
    
    const builder = new MessageBuilder()
        .addTitle("📋 Форма отчета за смену")
        .newLine(2)
        .addBold("Пожалуйста, заполните все поля:");
    
    if (editingField) {
        builder.addText(` ${fieldIcon} Введите сумму для поля "${fieldLabel}":`);
    }
    builder.newLine(2);
    
    // Add indicators for fields with arrows if they are being edited
    const cardIndicator = (editingField === 'card') ? ' 👉' : '';
    const cashIndicator = (editingField === 'cash') ? ' 👉' : '';
    const qrIndicator = (editingField === 'qr') ? ' 👉' : '';
    const transferIndicator = (editingField === 'transfer') ? ' 👉' : '';
    const returnsIndicator = (editingField === 'returns') ? ' 👉' : '';
    
    builder
        .addText(`${cardStatus} 💳 Безналичный расчет: ${cardValue}${cardIndicator}`)
        .newLine()
        .addText(`${cashStatus} 💵 Наличные: ${cashValue}${cashIndicator}`)
        .newLine()
        .addText(`${qrStatus} 📱 Оплата по QR-коду: ${qrValue}${qrIndicator}`)
        .newLine()
        .addText(`${transferStatus} 🔄 Переводом: ${transferValue}${transferIndicator}`)
        .newLine()
        .addText(`${returnsStatus} ↩️ Возвраты: ${returnsValue}${returnsIndicator}`)
        .newLine(2)
        .addBold(`💰 Общая выручка: ${totalRevenueText}`)
        .newLine(2)
        .addText("Для заполнения поля нажмите на соответствующую кнопку.")
        .newLine()
        .addText("Для редактирования любого значения нажмите на кнопку с нужным полем.");

    // Create keyboard with edit buttons for each field, with indicator for currently editing field
    const cardButtonText = (editingField === 'card') ? `💳 Безнал ${cardStatus} 👈` : `💳 Безнал ${cardStatus}`;
    const cashButtonText = (editingField === 'cash') ? `💵 Наличные ${cashStatus} 👈` : `💵 Наличные ${cashStatus}`;
    const qrButtonText = (editingField === 'qr') ? `📱 QR-код ${qrStatus} 👈` : `📱 QR-код ${qrStatus}`;
    const transferButtonText = (editingField === 'transfer') ? `🔄 Перевод ${transferStatus} 👈` : `🔄 Перевод ${transferStatus}`;
    const returnsButtonText = (editingField === 'returns') ? `↩️ Возвраты ${returnsStatus} 👈` : `↩️ Возвраты ${returnsStatus}`;

    // Create keyboard with edit buttons for each field
    const keyboard: Array<Array<{ text: string; callback_data: string }>> = [
        [
            { text: cardButtonText, callback_data: "edit_card" },
            { text: cashButtonText, callback_data: "edit_cash" },
            { text: qrButtonText, callback_data: "edit_qr" }
        ],
        [
            { text: transferButtonText, callback_data: "edit_transfer" },
            { text: returnsButtonText, callback_data: "edit_returns" }
        ]
    ];

    // Add confirm button only if all fields are filled
    if (allFieldsFilled) {
        const cashValue = Number(safeReportData.cash) || 0;
        const cardValue = Number(safeReportData.card) || 0;
        const qrValue = Number(safeReportData.qr) || 0;
        const transferValue = Number(safeReportData.transfer) || 0;
        const returnsValue = Number(safeReportData.returns) || 0;
        
        const totalRevenue = cashValue + cardValue + qrValue + transferValue - returnsValue;
        keyboard.push([{ text: `✅ Подтвердить отчет: ${totalRevenue.toLocaleString('ru-RU')} руб.`, callback_data: "report_form_confirm" }]);
    }

    keyboard.push([{ text: "⬅️ Назад", callback_data: "back_to_seller_menu" }]);

    return sendOrEdit(client, chatId, builder.build(), { inline_keyboard: keyboard }, messageId);
};

// --- Work Materials Section ---
export const showWorkMaterialsMenu = async (client: TelegramClient, chatId: number, messageId?: number, role: 'seller' | 'supervisor' | 'manager' = 'seller') => {
    const text = new MessageBuilder()
        .addTitle("📚 Все для работы")
        .newLine(2)
        .addText("Выберите категорию материалов:")
        .build();
    
    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "📋 Регламенты", callback_data: `work_materials_regulations_${role}` }],
            [{ text: "📁 Информационные материалы", callback_data: `work_materials_info_${role}` }],
            [{ text: "💬 Скрипты", callback_data: `work_materials_scripts_${role}` }],
            [{ text: "⬅️ Назад", callback_data: `back_to_${role}_menu` }],
        ],
    };
    return sendOrEdit(client, chatId, text, keyboard, messageId);
};

export const showWorkMaterialsByCategory = async (client: TelegramClient, chatId: number, category: string, role: 'seller' | 'supervisor' | 'manager', messageId?: number) => {
    // Map category to proper display name
    const categoryNames: Record<string, string> = {
        'regulations': '📋 Регламенты',
        'materials': '📁 Информационные материалы', 
        'scripts': '💬 Скрипты'
    };
    
    const categoryName = categoryNames[category] || 'Материалы';
    const materials = getMaterialsByCategoryAndRole(category, role);
    
    const builder = new MessageBuilder()
        .addTitle(categoryName)
        .newLine(2);
    
    if (materials.length === 0) {
        builder.addText("Материалы в этой категории отсутствуют");
    } else {
        materials.forEach((material: WorkMaterial) => {
            builder
                .addListItem(`${material.title}`)
                .addText(` (${material.fileSize})`)
                .newLine();
        });
    }
    
    const text = builder.build();
    
    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "⬅️ Назад", callback_data: `work_materials_menu_${role}` }],
        ],
    };
    return sendOrEdit(client, chatId, text, keyboard, messageId);
};

// --- Role Selection Menu ---
export const showRoleSelectionMenu = async (client: TelegramClient, chatId: number, messageId?: number) => {
    const text = new MessageBuilder()
        .addTitle("🤖 Демонстрация Sales Bot")
        .newLine(2)
        .addText("Это proof-of-concept бот, демонстрирующий возможности системы управления торговыми точками.")
        .newLine(2)
        .addText("Выберите роль для входа в демо-режим:")
        .build();
    
    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [
                { text: "💼 Продавец", callback_data: "role_seller" },
                { text: "📋 Супервайзер", callback_data: "role_supervisor" }
            ],
            [
                { text: "📊 Руководство", callback_data: "role_manager" }
            ]
        ],
    };
    return sendOrEdit(client, chatId, text, keyboard, messageId);
};

export const showInDevelopment = async (client: TelegramClient, queryId: string) => {
    await client.answerCallbackQuery({
        callback_query_id: queryId,
        text: "Этот раздел находится в разработке.",
        show_alert: true,
    });
};