// Chart instances
let pieChart, barChart, lineChart;

// Menu items for random top sellers
const menuItems = [
    { name: 'Sushi', price: 149, category: 'Japanese' },
    { name: 'Ramen', price: 129, category: 'Japanese' },
    { name: 'Tempura', price: 119, category: 'Japanese' },
    { name: 'Takoyaki', price: 89, category: 'Japanese' },
    { name: 'Chicken Katsu', price: 139, category: 'Japanese' },
    { name: 'Mugicha', price: 59, category: 'Japanese' },
    { name: 'Matcha Latte', price: 79, category: 'Japanese' },
    { name: 'Ramune', price: 49, category: 'Japanese' },
    { name: 'Kimchi', price: 59, category: 'Korean' },
    { name: 'Bibimbap', price: 139, category: 'Korean' },
    { name: 'Bulgogi', price: 159, category: 'Korean' },
    { name: 'Tteokbokki', price: 99, category: 'Korean' },
    { name: 'Japchae', price: 129, category: 'Korean' },
    { name: 'Sikhye', price: 55, category: 'Korean' },
    { name: 'Banana Mat Uyu', price: 49, category: 'Korean' },
    { name: 'Milkis', price: 45, category: 'Korean' }
];

// Dummy data for Day 1 (Low - Before Strategy)
const day1Data = {
    orders: 10,
    revenue: 0,
    avgOrder: 0,
    topItems: [],
    hourlyData: [],
    categoryData: { Japanese: 0, Korean: 0 },
    strategies: [
        { name: 'Combo Deals', icon: '🔥', detail: 'Not activated', active: false },
        { name: 'Volume Discount', icon: '💰', detail: 'Not activated', active: false },
        { name: 'Category Discount', icon: '🍱', detail: 'Not activated', active: false }
    ],
    insight: "Day 1 shows baseline sales with regular ordering patterns. No promotional strategies are active yet."
};

// Dummy data for Day 2 (High - After Strategy)
const day2Data = {
    orders: 50,
    revenue: 0,
    avgOrder: 0,
    topItems: [],
    hourlyData: [],
    categoryData: { Japanese: 0, Korean: 0 },
    strategies: [
        { name: 'Combo Deals', icon: '🔥', detail: 'Activated - Bundle deals available', active: true },
        { name: 'Volume Discount', icon: '💰', detail: 'Target: ₱500 | 10% off', active: true },
        { name: 'Category Discount', icon: '🍱', detail: 'Japanese Foods: 15% off', active: true }
    ],
    insight: "Day 2 shows a significant increase in orders due to active promotional strategies!"
};

// Generate random top items
function generateTopItems(orderCount) {
    const shuffled = [...menuItems].sort(() => Math.random() - 0.5);
    const topCount = Math.min(5, Math.floor(orderCount / 5) + 2);
    const topItems = [];
    
    for (let i = 0; i < topCount; i++) {
        const qty = Math.floor(Math.random() * (orderCount / 3)) + 1;
        const revenue = qty * shuffled[i].price;
        topItems.push({
            name: shuffled[i].name,
            qty: qty,
            revenue: revenue
        });
    }
    
    return topItems.sort((a, b) => b.revenue - a.revenue);
}

// Generate hourly sales data
function generateHourlyData(orderCount, isHighDay) {
    const hours = ['10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM'];
    const hourlyData = [];
    
    // Peak hours at lunch (12PM-1PM) and dinner (6PM-8PM)
    const peakMultiplier = isHighDay ? 3 : 1.5;
    
    hours.forEach((hour, index) => {
        let baseOrders;
        
        // Low traffic hours: 10AM, 11AM, 2PM, 3PM, 4PM
        if (index <= 1 || (index >= 3 && index <= 5)) {
            baseOrders = Math.floor(orderCount * 0.05);
        }
        // Peak hours: 12PM, 1PM, 6PM, 7PM
        else if (index === 2 || index === 3 || index >= 6 && index <= 7) {
            baseOrders = Math.floor(orderCount * 0.15 * peakMultiplier);
        }
        // Moderate hours: 5PM, 8PM
        else {
            baseOrders = Math.floor(orderCount * 0.1 * peakMultiplier);
        }
        
        const revenue = baseOrders * (isHighDay ? 180 : 160);
        
        hourlyData.push({
            hour: hour,
            orders: baseOrders,
            revenue: revenue
        });
    });
    
    return hourlyData;
}

// Calculate category data
function calculateCategoryData(topItems) {
    const categoryData = { Japanese: 0, Korean: 0 };
    
    topItems.forEach(item => {
        const menuItem = menuItems.find(m => m.name === item.name);
        if (menuItem) {
            categoryData[menuItem.category] += item.revenue;
        }
    });
    
    // Add some randomization to make it look more realistic
    const total = categoryData.Japanese + categoryData.Korean;
    if (total > 0) {
        categoryData.Japanese = Math.floor(categoryData.Japanese + Math.random() * total * 0.3);
        categoryData.Korean = total > 0 ? total - categoryData.Japanese + Math.floor(Math.random() * total * 0.2) : Math.floor(Math.random() * total * 0.3);
    }
    
    return categoryData;
}

// Calculate revenue based on orders
function calculateRevenue(orderCount, avgPrice) {
    return orderCount * avgPrice;
}

// Format currency
function formatCurrency(amount) {
    return '₱' + amount.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// Chart.js default options
Chart.defaults.color = '#ccc';
Chart.defaults.borderColor = 'rgba(255,255,255,0.1)';

// Create Pie Chart
function createPieChart(data) {
    const ctx = document.getElementById('pieChart').getContext('2d');
    
    if (pieChart) {
        pieChart.destroy();
    }
    
    pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Japanese Menu', 'Korean Menu'],
            datasets: [{
                data: [data.categoryData.Japanese, data.categoryData.Korean],
                backgroundColor: [
                    'rgba(255, 107, 107, 0.8)',
                    'rgba(78, 205, 196, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 107, 107, 1)',
                    'rgba(78, 205, 196, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            }
        }
    });
}

// Create Bar Chart
function createBarChart(topItems) {
    const ctx = document.getElementById('barChart').getContext('2d');
    
    if (barChart) {
        barChart.destroy();
    }
    
    const labels = topItems.map(item => item.name);
    const revenues = topItems.map(item => item.revenue);
    
    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue (₱)',
                data: revenues,
                backgroundColor: 'rgba(255, 107, 53, 0.7)',
                borderColor: 'rgba(255, 107, 53, 1)',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Revenue: ' + formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₱' + value;
                        }
                    }
                }
            }
        }
    });
}

// Create Line Chart
function createLineChart(hourlyData) {
    const ctx = document.getElementById('lineChart').getContext('2d');
    
    if (lineChart) {
        lineChart.destroy();
    }
    
    const labels = hourlyData.map(data => data.hour);
    const orders = hourlyData.map(data => data.orders);
    const revenues = hourlyData.map(data => data.revenue);
    
    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Orders',
                    data: orders,
                    borderColor: 'rgba(78, 205, 196, 1)',
                    backgroundColor: 'rgba(78, 205, 196, 0.2)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Revenue (₱)',
                    data: revenues,
                    borderColor: 'rgba(255, 107, 53, 1)',
                    backgroundColor: 'rgba(255, 107, 53, 0.2)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.label === 'Orders') {
                                return 'Orders: ' + context.raw;
                            }
                            return 'Revenue: ' + formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Orders'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Revenue (₱)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '₱' + value;
                        }
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

// Update dashboard display
function updateDashboard(day) {
    const data = day === 'day1' ? day1Data : day2Data;
    const isHighDay = day === 'day2';
    
    // Regenerate random values each time
    if (day === 'day1') {
        data.orders = 10; // Fixed 10 orders
        data.topItems = generateTopItems(data.orders);
        data.hourlyData = generateHourlyData(data.orders, false);
        data.categoryData = calculateCategoryData(data.topItems);
        const avgPrice = Math.floor(Math.random() * 50) + 150; // 150-200
        data.revenue = calculateRevenue(data.orders, avgPrice);
        data.avgOrder = avgPrice;
    } else {
        data.orders = 50; // Fixed 50 orders
        data.topItems = generateTopItems(data.orders);
        data.hourlyData = generateHourlyData(data.orders, true);
        data.categoryData = calculateCategoryData(data.topItems);
        const avgPrice = Math.floor(Math.random() * 40) + 180; // 180-220
        data.revenue = calculateRevenue(data.orders, avgPrice);
        data.avgOrder = avgPrice;
    }
    
    // Update stats
    document.getElementById('totalOrders').textContent = data.orders;
    document.getElementById('totalRevenue').textContent = formatCurrency(data.revenue);
    document.getElementById('avgOrder').textContent = formatCurrency(data.avgOrder);
    
    // Top selling item
    if (data.topItems.length > 0) {
        document.getElementById('topItem').textContent = data.topItems[0].name;
    }
    
    // Update charts
    createPieChart(data);
    createBarChart(data.topItems);
    createLineChart(data.hourlyData);
    
    // Top items list
    const topItemsList = document.getElementById('topItemsList');
    topItemsList.innerHTML = data.topItems.map((item, index) => `
        <div class="top-item-row">
            <span class="top-item-rank">${index + 1}</span>
            <span class="top-item-name">${item.name}</span>
            <span class="top-item-qty">x${item.qty}</span>
            <span class="top-item-revenue">${formatCurrency(item.revenue)}</span>
        </div>
    `).join('');
    
    // Strategies list
    const strategiesList = document.getElementById('strategiesList');
    strategiesList.innerHTML = data.strategies.map(strategy => `
        <div class="strategy-row ${strategy.active ? 'active' : 'inactive'}">
            <span class="strategy-icon">${strategy.icon}</span>
            <div class="strategy-info">
                <div class="strategy-name">${strategy.name}</div>
                <div class="strategy-detail">${strategy.detail}</div>
            </div>
            <span class="strategy-status ${strategy.active ? 'on' : 'off'}">
                ${strategy.active ? 'ON' : 'OFF'}
            </span>
        </div>
    `).join('');
    
    // Day insight
    const insightElement = document.getElementById('dayInsight');
    if (day === 'day1') {
        insightElement.innerHTML = `
            <span class="insight-highlight">Day 1</span> shows baseline sales with ${data.orders} orders 
            generating <span class="insight-highlight">${formatCurrency(data.revenue)}</span> in revenue. 
            No promotional strategies are currently active. Consider activating combo deals or discounts to boost sales!
        `;
    } else {
        const increase = Math.floor((50 - 10) / 10 * 100);
        insightElement.innerHTML = `
            Great results! <span class="insight-highlight">Day 2</span> shows ${data.orders} orders 
            generating <span class="insight-highlight">${formatCurrency(data.revenue)}</span> in revenue. 
            This is a <span class="insight-highlight">${increase}% increase</span> from Day 1! 
            The active promotional strategies are working effectively.
        `;
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    const daySelect = document.getElementById('daySelect');
    
    // Set default to Day 1
    daySelect.value = 'day1';
    
    // Initial render
    updateDashboard('day1');
    
    // Handle day selection change
    daySelect.addEventListener('change', function() {
        updateDashboard(this.value);
    });
});
