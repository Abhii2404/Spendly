'use client'

import React, { useEffect } from 'react'
import { BarChart2, AlertCircle } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import DynamicIcon from '@/components/ui/DynamicIcon'
import { useAnalyticsData } from '@/hooks/useAnalyticsData'
import { useRefetch } from '@/context/RefetchContext'
import { formatAmount } from '@/lib/utils'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

ChartJS.defaults.color = '#6B7280'
ChartJS.defaults.font.family = '"Plus Jakarta Sans", sans-serif'

ChartJS.defaults.font.family = '"Plus Jakarta Sans", sans-serif'

export default function AnalyticsPage() {
  const {
    totalIncome,
    totalExpense,
    netProfit,
    pieChartData,
    barChartData,
    lineChartData,
    pieType,
    linePeriod,
    lineType,
    setPieType,
    setLinePeriod,
    setLineType,
    isLoading,
    error,
    refetch
  } = useAnalyticsData()

  const { setRefetchDashboard } = useRefetch()

  useEffect(() => {
    setRefetchDashboard(refetch)
  }, [refetch, setRefetchDashboard])

  // Get total for pie chart center
  const pieTotal = pieChartData.reduce((acc, curr) => acc + curr.amount, 0)

  // Pie Chart config
  const pieData = {
    labels: pieChartData.map(d => d.categoryName),
    datasets: [
      {
        data: pieChartData.map(d => d.amount),
        backgroundColor: pieChartData.map(d => d.categoryColor),
        borderWidth: 0,
        cutout: '70%',
      },
    ],
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const val = context.raw || 0
            return ` ₹${val.toLocaleString('en-IN')} (${pieChartData[context.dataIndex].percentage.toFixed(1)}%)`
          }
        }
      }
    }
  }

  // Bar Chart config
  const barData = {
    labels: barChartData.map(d => d.month),
    datasets: [
      {
        label: 'Income',
        data: barChartData.map(d => d.income),
        backgroundColor: '#42E3D0',
        borderRadius: 4,
        borderSkipped: false,
        barPercentage: 0.6,
        categoryPercentage: 0.8
      },
      {
        label: 'Expense',
        data: barChartData.map(d => d.expense),
        backgroundColor: '#F86161',
        borderRadius: 4,
        borderSkipped: false,
        barPercentage: 0.6,
        categoryPercentage: 0.8
      }
    ]
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        border: { display: false },
        ticks: { 
          color: '#6B7280',
          autoSkip: true,
          maxTicksLimit: 6,
          font: { size: 10 },
          callback: (value: any) => formatAmount(value)
        }
      },
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#6B7280', font: { size: 10 } }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => ` ${context.dataset.label}: ${formatAmount(context.raw || 0)}`
        }
      }
    }
  }

  // Line Chart config
  const lineDataObj = {
    labels: lineChartData.map(d => d.label),
    datasets: [
      {
        label: lineType === 'income' ? 'Income' : 'Expense',
        data: lineChartData.map(d => d.value),
        borderColor: '#6A42E3',
        backgroundColor: (context: any) => {
          const chart = context.chart
          const { ctx, chartArea } = chart
          if (!chartArea) return 'rgba(106,66,227,0.1)'
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          gradient.addColorStop(0, 'rgba(106,66,227,0.3)')
          gradient.addColorStop(1, 'rgba(106,66,227,0)')
          return gradient
        },
        borderWidth: 2,
        fill: true,
        pointBackgroundColor: '#6A42E3',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
      }
    ]
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        border: { display: false },
        ticks: { 
          color: '#6B7280',
          autoSkip: true,
          maxTicksLimit: 6,
          font: { size: 10 },
          callback: (value: any) => formatAmount(value)
        }
      },
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#6B7280', font: { size: 10 } }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => ` Amount: ${formatAmount(context.raw || 0)}`
        }
      }
    }
  }

  const EmptyState = ({ type }: { type: string }) => (
    <div className="min-h-[160px] flex flex-col items-center justify-center gap-[12px] text-center">
      <BarChart2 size={40} color="#374151" />
      <div>
        <div className="text-[14px] font-[600] text-[#6B7280] mb-[2px]">Not enough data yet.</div>
        <div className="text-[12px] text-[#374151]">Add {type} to see insights.</div>
      </div>
    </div>
  )

  const ChartCardSkeleton = () => (
    <div className="h-[300px] animate-pulse bg-[rgba(255,255,255,0.06)] rounded-[20px] mb-[16px]"></div>
  )

  return (
    <div className="min-h-screen bg-[#091428] pb-[100px] max-w-[430px] mx-auto w-full animate-fade-in-up">
      <PageHeader title="Analytics" />
      
      <div className="px-[20px] pb-[20px]">
        {error && (
          <div className="flex items-center gap-[12px] p-[16px] rounded-[12px] mb-[16px]" style={{ background: 'rgba(248,97,97,0.08)', border: '1px solid rgba(248,97,97,0.2)' }}>
            <AlertCircle className="shrink-0 text-[#F86161]" size={20} />
            <div className="text-[#F86161] text-[14px]">Something went wrong. Please refresh and try again.</div>
          </div>
        )}

        {/* Task 2: Summary Cards Row */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-[10px] mb-[24px]">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className="h-[72px] rounded-[16px] animate-pulse"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-[10px] mb-[24px]">
            <div 
              className="rounded-[16px] p-[14px_12px]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}
            >
              <span className="block text-[10px] font-[500] text-[#6B7280] uppercase tracking-[0.05em] mb-[6px]">Income</span>
              <span className="block text-[16px] sm:text-[14px] font-[800] text-[#42E3D0] whitespace-nowrap overflow-hidden text-ellipsis" title={formatAmount(totalIncome)}>
                {formatAmount(totalIncome)}
              </span>
            </div>
            <div 
              className="rounded-[16px] p-[14px_12px]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}
            >
              <span className="block text-[10px] font-[500] text-[#6B7280] uppercase tracking-[0.05em] mb-[6px]">Expense</span>
              <span className="block text-[16px] sm:text-[14px] font-[800] text-[#F86161] whitespace-nowrap overflow-hidden text-ellipsis" title={formatAmount(totalExpense)}>
                {formatAmount(totalExpense)}
              </span>
            </div>
            <div 
              className="rounded-[16px] p-[14px_12px]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}
            >
              <span className="block text-[10px] font-[500] text-[#6B7280] uppercase tracking-[0.05em] mb-[6px]">Net Profit</span>
              <span 
                className={`block text-[16px] sm:text-[14px] font-[800] whitespace-nowrap overflow-hidden text-ellipsis ${netProfit >= 0 ? 'text-[#42E3D0]' : 'text-[#F86161]'}`}
                title={(netProfit >= 0 ? '+' : '') + formatAmount(netProfit)}
              >
                {netProfit >= 0 ? '+' : ''}{formatAmount(netProfit)}
              </span>
            </div>
          </div>
        )}

        {/* Task 5: Pie/Doughnut Chart Section */}
        {isLoading ? <ChartCardSkeleton /> : (
          <div 
            className="rounded-[20px] p-[20px] mb-[16px]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}
          >
            <div className="flex justify-between items-start mb-[16px]">
              <div>
                <h2 className="text-[16px] font-[700] text-[#FFFFFF]">Category Breakdown</h2>
                <div className="text-[12px] text-[#6B7280] mt-[2px]">Current month</div>
              </div>
              <div className="inline-flex bg-[rgba(255,255,255,0.06)] rounded-full p-[3px] gap-[2px]">
                <button
                  onClick={() => setPieType('income')}
                  className={`p-[5px_12px] rounded-full text-[12px] font-[600] transition-all duration-150 cursor-pointer border-none ${
                    pieType === 'income' ? 'bg-[#6A42E3] text-[#FFFFFF]' : 'bg-transparent text-[#6B7280] hover:text-[#FFFFFF]'
                  }`}
                >
                  Income
                </button>
                <button
                  onClick={() => setPieType('expense')}
                  className={`p-[5px_12px] rounded-full text-[12px] font-[600] transition-all duration-150 cursor-pointer border-none ${
                    pieType === 'expense' ? 'bg-[#6A42E3] text-[#FFFFFF]' : 'bg-transparent text-[#6B7280] hover:text-[#FFFFFF]'
                  }`}
                >
                  Expense
                </button>
              </div>
            </div>

            {pieChartData.length === 0 ? <EmptyState type="transactions" /> : (
              <>
                <div className="relative h-[220px] mb-[20px]">
                  <Doughnut data={pieData} options={pieOptions} />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <span className="text-[11px] text-[#6B7280] block mb-[4px]">Total</span>
                    <span className="text-[20px] font-[800] text-[#FFFFFF] block leading-none">
                      {formatAmount(pieTotal)}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-[10px] mt-[4px]">
                  {pieChartData.map(slice => (
                    <div key={slice.categoryName} className="flex items-center justify-between py-[8px] border-b-[1px_solid_rgba(255,255,255,0.05)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors rounded-[8px] px-[4px] -mx-[4px]">
                      <div className="flex items-center gap-[10px]">
                        <div 
                          className="w-[10px] h-[10px] rounded-full shrink-0"
                          style={{ background: slice.categoryColor }}
                        />
                        <div className="flex items-center gap-[6px]">
                          <DynamicIcon name={slice.categoryIcon} size={14} color={slice.categoryColor} />
                          <span className="text-[13px] text-[#FFFFFF] font-[500] whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] sm:max-w-[120px]">
                            {slice.categoryName}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-[12px]">
                        <span className="text-[13px] font-[600] text-[#FFFFFF]">
                          {formatAmount(slice.amount)}
                        </span>
                        <span 
                          className="text-[11px] font-[600] rounded-full p-[2px_7px]"
                          style={{ 
                            color: slice.categoryColor, 
                            backgroundColor: `${slice.categoryColor}1F` // 12% opacity roughly
                          }}
                        >
                          {slice.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Task 6: Bar Chart Section */}
        {isLoading ? <ChartCardSkeleton /> : (
          <div 
            className="rounded-[20px] p-[20px] mb-[16px]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}
          >
            <div className="flex justify-between items-start mb-[16px]">
              <div>
                <h2 className="text-[16px] font-[700] text-[#FFFFFF]">Income vs Expense</h2>
                <div className="text-[12px] text-[#6B7280] mt-[2px]">Last 6 months</div>
              </div>
            </div>

            {barChartData.every(d => d.income === 0 && d.expense === 0) ? <EmptyState type="data" /> : (
              <>
                <div className="h-[220px] relative">
                  <Bar data={barData} options={barOptions} />
                </div>
                <div className="flex justify-center gap-[20px] mt-[16px]">
                  <div className="flex items-center gap-[6px] text-[12px] text-[#6B7280]">
                    <div className="w-[8px] h-[8px] rounded-full bg-[#42E3D0]" />
                    <span>Income</span>
                  </div>
                  <div className="flex items-center gap-[6px] text-[12px] text-[#6B7280]">
                    <div className="w-[8px] h-[8px] rounded-full bg-[#F86161]" />
                    <span>Expense</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Task 7: Line Chart Section */}
        {isLoading ? <ChartCardSkeleton /> : (
          <div 
            className="rounded-[20px] p-[20px] mb-[16px]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}
          >
            <div className="flex justify-between items-start mb-[16px]">
              <div>
                <h2 className="text-[16px] font-[700] text-[#FFFFFF]">Trend</h2>
                <div className="text-[12px] text-[#6B7280] mt-[2px]">Over time</div>
              </div>
              <div className="flex flex-col items-end gap-[8px]">
                <div className="inline-flex bg-[rgba(255,255,255,0.06)] rounded-full p-[3px] gap-[2px]">
                  {['weekly', 'monthly', 'quarterly'].map(period => (
                    <button
                      key={period}
                      onClick={() => setLinePeriod(period as any)}
                      className={`p-[5px_12px] rounded-full text-[12px] font-[600] transition-all duration-150 cursor-pointer border-none capitalize ${
                        linePeriod === period ? 'bg-[#6A42E3] text-[#FFFFFF]' : 'bg-transparent text-[#6B7280] hover:text-[#FFFFFF]'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
                
                <div className="inline-flex bg-[rgba(255,255,255,0.06)] rounded-full p-[3px] gap-[2px]">
                  <button
                    onClick={() => setLineType('income')}
                    className={`p-[5px_12px] rounded-full text-[12px] font-[600] transition-all duration-150 cursor-pointer border-none ${
                        lineType === 'income' ? 'bg-[#6A42E3] text-[#FFFFFF]' : 'bg-transparent text-[#6B7280] hover:text-[#FFFFFF]'
                    }`}
                  >
                    Income
                  </button>
                  <button
                    onClick={() => setLineType('expense')}
                    className={`p-[5px_12px] rounded-full text-[12px] font-[600] transition-all duration-150 cursor-pointer border-none ${
                        lineType === 'expense' ? 'bg-[#6A42E3] text-[#FFFFFF]' : 'bg-transparent text-[#6B7280] hover:text-[#FFFFFF]'
                    }`}
                  >
                    Expense
                  </button>
                </div>
              </div>
            </div>

            {lineChartData.every(d => d.value === 0) ? <EmptyState type="data" /> : (
              <div className="h-[200px] relative">
                <Line data={lineDataObj} options={lineOptions} />
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
