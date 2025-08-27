// Charts Handler for Nebraska Huskers Game Sheet Generator
// Handles all chart creation and visualization

class HuskersCharts {
    constructor() {
        this.charts = new Map();
        this.defaultColors = CONFIG.CHARTS.colors;
        
        // Ensure Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is required for visualizations');
            return;
        }
        
        // Set Chart.js defaults
        Chart.defaults.font.family = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        Chart.defaults.font.size = 12;
        Chart.defaults.color = '#374151';
        
        console.log('HuskersCharts initialized');
    }
    
    // Create radar chart for team comparison
    createRadarChart(containerId, nebraskaData, opponentData, opponentName) {
        const ctx = document.getElementById(containerId);
        if (!ctx) {
            console.error(`Chart container ${containerId} not found`);
            return null;
        }
        
        // Destroy existing chart if it exists
        if (this.charts.has(containerId)) {
            this.charts.get(containerId).destroy();
        }
        
        const data = {
            labels: ['Offense', 'Defense', 'Special Teams', 'Rushing', 'Passing', 'Red Zone'],
            datasets: [
                {
                    label: 'Nebraska',
                    data: [
                        this.normalizeValue(nebraskaData.offense.pointsPerGame, 0, 50),
                        this.normalizeValue(100 - nebraskaData.defense.pointsAllowed, 0, 50),
                        this.normalizeValue(nebraskaData.specialTeams.fieldGoalPct, 0, 100),
                        this.normalizeValue(nebraskaData.offense.rushingYards, 0, 300),
                        this.normalizeValue(nebraskaData.offense.passingYards, 0, 400),
                        this.normalizeValue(nebraskaData.offense.redZoneEff, 0, 100)
                    ],
                    backgroundColor: this.defaultColors.nebraska + '33',
                    borderColor: this.defaultColors.nebraska,
                    borderWidth: 2,
                    pointBackgroundColor: this.defaultColors.nebraska,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                },
                {
                    label: opponentName,
                    data: [
                        this.normalizeValue(opponentData.offense.pointsPerGame, 0, 50),
                        this.normalizeValue(100 - opponentData.defense.pointsAllowed, 0, 50),
                        this.normalizeValue(opponentData.specialTeams.fieldGoalPct, 0, 100),
                        this.normalizeValue(opponentData.offense.rushingYards, 0, 300),
                        this.normalizeValue(opponentData.offense.passingYards, 0, 400),
                        this.normalizeValue(opponentData.offense.redZoneEff, 0, 100)
                    ],
                    backgroundColor: this.defaultColors.opponent + '33',
                    borderColor: this.defaultColors.opponent,
                    borderWidth: 2,
                    pointBackgroundColor: this.defaultColors.opponent,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }
            ]
        };
        
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: {
                        display: true,
                        color: '#e5e7eb'
                    },
                    grid: {
                        color: '#e5e7eb'
                    },
                    pointLabels: {
                        font: {
                            size: 14,
                            weight: '600'
                        },
                        color: '#374151'
                    },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#374151',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        };
        
        const chart = new Chart(ctx, {
            type: 'radar',
            data: data,
            options: options
        });
        
        this.charts.set(containerId, chart);
        return chart;
    }
    
    // Create line chart for trends
    createTrendChart(containerId, trendData, nebraskaLabel = 'Nebraska', opponentLabel = 'Opponent') {
        const ctx = document.getElementById(containerId);
        if (!ctx) {
            console.error(`Chart container ${containerId} not found`);
            return null;
        }
        
        // Destroy existing chart if it exists
        if (this.charts.has(containerId)) {
            this.charts.get(containerId).destroy();
        }
        
        const data = {
            labels: trendData.map(item => item.week || item.game || item.label),
            datasets: [
                {
                    label: nebraskaLabel,
                    data: trendData.map(item => item.nebraska),
                    borderColor: this.defaultColors.nebraska,
                    backgroundColor: this.defaultColors.nebraska + '20',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: this.defaultColors.nebraska,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                },
                {
                    label: opponentLabel,
                    data: trendData.map(item => item.opponent),
                    borderColor: this.defaultColors.opponent,
                    backgroundColor: this.defaultColors.opponent + '20',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: this.defaultColors.opponent,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }
            ]
        };
        
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        color: '#f3f4f6'
                    },
                    ticks: {
                        font: {
                            size: 12
                        },
                        color: '#6b7280'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f3f4f6'
                    },
                    ticks: {
                        font: {
                            size: 12
                        },
                        color: '#6b7280'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#374151',
                    borderWidth: 1,
                    cornerRadius: 8
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            animation: {
                duration: 1200,
                easing: 'easeOutQuart'
            }
        };
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: options
        });
        
        this.charts.set(containerId, chart);
        return chart;
    }
    
    // Create bar chart for efficiency metrics
    createEfficiencyChart(containerId, efficiencyData, nebraskaLabel = 'Nebraska', opponentLabel = 'Opponent') {
        const ctx = document.getElementById(containerId);
        if (!ctx) {
            console.error(`Chart container ${containerId} not found`);
            return null;
        }
        
        // Destroy existing chart if it exists
        if (this.charts.has(containerId)) {
            this.charts.get(containerId).destroy();
        }
        
        const data = {
            labels: efficiencyData.map(item => item.metric || item.label),
            datasets: [
                {
                    label: nebraskaLabel,
                    data: efficiencyData.map(item => item.nebraska),
                    backgroundColor: this.defaultColors.nebraska + 'CC',
                    borderColor: this.defaultColors.nebraska,
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false
                },
                {
                    label: opponentLabel,
                    data: efficiencyData.map(item => item.opponent),
                    backgroundColor: this.defaultColors.opponent + 'CC',
                    borderColor: this.defaultColors.opponent,
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false
                }
            ]
        };
        
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11,
                            weight: '600'
                        },
                        color: '#374151',
                        maxRotation: 45
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f3f4f6'
                    },
                    ticks: {
                        font: {
                            size: 12
                        },
                        color: '#6b7280'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#374151',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        };
        
        const chart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: options
        });
        
        this.charts.set(containerId, chart);
        return chart;
    }
    
    // Create donut chart for win probability or other percentages
    createDonutChart(containerId, data, labels, colors = null) {
        const ctx = document.getElementById(containerId);
        if (!ctx) {
            console.error(`Chart container ${containerId} not found`);
            return null;
        }
        
        // Destroy existing chart if it exists
        if (this.charts.has(containerId)) {
            this.charts.get(containerId).destroy();
        }
        
        const chartColors = colors || [
            this.defaultColors.nebraska,
            this.defaultColors.opponent,
            this.defaultColors.neutral
        ];
        
        const chartData = {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: chartColors.map(color => color + 'CC'),
                borderColor: chartColors,
                borderWidth: 2,
                hoverBackgroundColor: chartColors.map(color => color + 'FF'),
                hoverBorderWidth: 3
            }]
        };
        
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#374151',
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${percentage}%`;
                        }
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeOutQuart'
            }
        };
        
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: options
        });
        
        this.charts.set(containerId, chart);
        return chart;
    }
    
    // Create horizontal bar chart for player comparisons
    createPlayerComparisonChart(containerId, playerData) {
        const ctx = document.getElementById(containerId);
        if (!ctx) {
            console.error(`Chart container ${containerId} not found`);
            return null;
        }
        
        // Destroy existing chart if it exists
        if (this.charts.has(containerId)) {
            this.charts.get(containerId).destroy();
        }
        
        const data = {
            labels: playerData.map(player => `${player.name} (${player.position})`),
            datasets: [{
                label: 'Player Grade',
                data: playerData.map(player => player.grade),
                backgroundColor: playerData.map(player => {
                    if (player.grade >= 85) return this.defaultColors.positive + 'CC';
                    if (player.grade >= 70) return this.defaultColors.warning + 'CC';
                    return this.defaultColors.negative + 'CC';
                }),
                borderColor: playerData.map(player => {
                    if (player.grade >= 85) return this.defaultColors.positive;
                    if (player.grade >= 70) return this.defaultColors.warning;
                    return this.defaultColors.negative;
                }),
                borderWidth: 2,
                borderRadius: 4
            }]
        };
        
        const options = {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: '#f3f4f6'
                    },
                    ticks: {
                        font: {
                            size: 12
                        },
                        color: '#6b7280'
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        color: '#374151'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#374151',
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                        afterLabel: function(context) {
                            const player = playerData[context.dataIndex];
                            return [
                                `Stats: ${player.stats}`,
                                `Status: ${player.injury}`
                            ];
                        }
                    }
                }
            },
            animation: {
                duration: 1200,
                easing: 'easeOutQuart'
            }
        };
        
        const chart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: options
        });
        
        this.charts.set(containerId, chart);
        return chart;
    }
    
    // Create betting line movement chart
    createLineMovementChart(containerId, movementData) {
        const ctx = document.getElementById(containerId);
        if (!ctx) {
            console.error(`Chart container ${containerId} not found`);
            return null;
        }
        
        // Destroy existing chart if it exists
        if (this.charts.has(containerId)) {
            this.charts.get(containerId).destroy();
        }
        
        const data = {
            labels: movementData.map(item => item.time),
            datasets: [
                {
                    label: 'Spread',
                    data: movementData.map(item => item.spread),
                    borderColor: this.defaultColors.nebraska,
                    backgroundColor: this.defaultColors.nebraska + '20',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.1,
                    pointBackgroundColor: this.defaultColors.nebraska,
                    pointRadius: 4
                },
                {
                    label: 'Over/Under',
                    data: movementData.map(item => item.total),
                    borderColor: this.defaultColors.opponent,
                    backgroundColor: this.defaultColors.opponent + '20',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.1,
                    pointBackgroundColor: this.defaultColors.opponent,
                    pointRadius: 4,
                    yAxisID: 'y1'
                }
            ]
        };
        
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        color: '#f3f4f6'
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        color: '#6b7280',
                        maxRotation: 45
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Spread',
                        color: this.defaultColors.nebraska,
                        font: {
                            weight: '600'
                        }
                    },
                    grid: {
                        color: '#f3f4f6'
                    },
                    ticks: {
                        color: this.defaultColors.nebraska
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Over/Under',
                        color: this.defaultColors.opponent,
                        font: {
                            weight: '600'
                        }
                    },
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        color: this.defaultColors.opponent
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#374151',
                    borderWidth: 1,
                    cornerRadius: 8
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        };
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: options
        });
        
        this.charts.set(containerId, chart);
        return chart;
    }
    
    // Utility function to normalize values for radar chart
    normalizeValue(value, min, max) {
        return Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
    }
    
    // Generate chart data for team comparison
    generateTeamComparisonData(nebraskaData, opponentData) {
        return {
            radar: [
                { category: 'Offense', nebraska: this.normalizeValue(nebraskaData.offense.pointsPerGame, 0, 50), opponent: this.normalizeValue(opponentData.offense.pointsPerGame, 0, 50) },
                { category: 'Defense', nebraska: this.normalizeValue(100 - nebraskaData.defense.pointsAllowed, 0, 50), opponent: this.normalizeValue(100 - opponentData.defense.pointsAllowed, 0, 50) },
                { category: 'Special Teams', nebraska: nebraskaData.specialTeams.fieldGoalPct, opponent: opponentData.specialTeams.fieldGoalPct },
                { category: 'Rushing', nebraska: this.normalizeValue(nebraskaData.offense.rushingYards, 0, 300), opponent: this.normalizeValue(opponentData.offense.rushingYards, 0, 300) },
                { category: 'Passing', nebraska: this.normalizeValue(nebraskaData.offense.passingYards, 0, 400), opponent: this.normalizeValue(opponentData.offense.passingYards, 0, 400) },
                { category: 'Red Zone', nebraska: nebraskaData.offense.redZoneEff, opponent: opponentData.offense.redZoneEff }
            ],
            
            trends: nebraskaData.trends.scoringTrend.map((score, index) => ({
                week: `Game ${index + 1}`,
                nebraska: score,
                opponent: opponentData.trends.scoringTrend[index]
            })),
            
            efficiency: [
                { metric: 'EPA/Play', nebraska: nebraskaData.advanced.offenseEPA, opponent: opponentData.advanced.offenseEPA },
                { metric: 'Success Rate', nebraska: nebraskaData.advanced.successRate, opponent: opponentData.advanced.successRate },
                { metric: 'Explosive Rate', nebraska: nebraskaData.advanced.explosivePlayRate, opponent: opponentData.advanced.explosivePlayRate },
                { metric: 'FPI Rating', nebraska: Math.abs(nebraskaData.advanced.fpi), opponent: Math.abs(opponentData.advanced.fpi) }
            ]
        };
    }
    
    // Generate mock betting line movement data
    generateBettingMovementData() {
        return [
            { time: 'Open', spread: -7.0, total: 54.0 },
            { time: '6 Days', spread: -6.5, total: 53.5 },
            { time: '5 Days', spread: -6.5, total: 53.0 },
            { time: '4 Days', spread: -6.0, total: 53.0 },
            { time: '3 Days', spread: -6.5, total: 53.5 },
            { time: 'Current', spread: -6.5, total: 53.5 }
        ];
    }
    
    // Destroy a specific chart
    destroyChart(containerId) {
        if (this.charts.has(containerId)) {
            this.charts.get(containerId).destroy();
            this.charts.delete(containerId);
        }
    }
    
    // Destroy all charts
    destroyAllCharts() {
        this.charts.forEach((chart, id) => {
            chart.destroy();
        });
        this.charts.clear();
    }
    
    // Update chart colors for theme changes
    updateChartColors(newColors) {
        this.defaultColors = { ...this.defaultColors, ...newColors };
        
        // Update existing charts
        this.charts.forEach(chart => {
            chart.update();
        });
    }
    
    // Export chart as image
    exportChart(containerId, format = 'png') {
        if (this.charts.has(containerId)) {
            const chart = this.charts.get(containerId);
            return chart.toBase64Image('image/' + format, 1.0);
        }
        return null;
    }
    
    // Get chart statistics
    getChartStats() {
        return {
            totalCharts: this.charts.size,
            chartIds: Array.from(this.charts.keys())
        };
    }
}

// Export the charts handler
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuskersCharts;
} else {
    window.HuskersCharts = HuskersCharts;
}
