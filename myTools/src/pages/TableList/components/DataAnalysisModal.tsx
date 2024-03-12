import React, { useState, useEffect } from 'react';
import { Modal, Spin, DatePicker } from 'antd';
import * as echarts from 'echarts';
import { PieChartOutlined } from '@ant-design/icons';
import moment from 'moment';

// LedgerEntry 接口定义
interface LedgerEntry {
  id: number;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
}

interface DataAnalysisModalProps {
  visible: boolean;
  data: LedgerEntry[];
  onClose: () => void;
}

const DataAnalysisModal: React.FC<DataAnalysisModalProps> = ({ visible, data, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<moment.Moment | null>(moment());

  // 过滤出选定月份的数据并处理
  const processDataForSelectedMonth = (selectedMonth: moment.Moment) => {
    setLoading(true);
    
    const filteredData = data.filter((entry) => {
      const entryMonth = moment(entry.date).startOf('month');
      return entryMonth.isSame(selectedMonth, 'month');
    });

    const totalAmount = filteredData.reduce((sum, entry) => sum + entry.amount, 0);
    const categories = Array.from(new Set(filteredData.map(entry => entry.category)));
    const seriesData = categories.map(category => ({
      name: category,
      value: filteredData.filter(entry => entry.category === category).reduce((sum, entry) => sum + entry.amount, 0) / totalAmount
    }));

    // 初始化 ECharts 实例
    const chartDom = document.getElementById('data-analysis-chart');
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      
      // 配置 ECharts 饼图
      myChart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          top: 'bottom'
        },
        series: [
          {
            name: 'Category',
            type: 'pie',
            radius: '50%',
            data: seriesData,
            emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
          }
        ]
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    if (visible && data.length && selectedMonth) {
      processDataForSelectedMonth(selectedMonth);
    }
  }, [visible, data, selectedMonth]);

  const handleMonthChange = (value: moment.Moment | null) => {
    if (value) {
      setSelectedMonth(value.startOf('month'));
    }
  };

  return (
    <Modal
      title={<><PieChartOutlined /> 数据分析</>}
      visible={visible}
      onCancel={onClose}
      footer={null}
    >
      <DatePicker
        picker="month"
        value={selectedMonth}
        onChange={handleMonthChange}
        style={{ marginBottom: 20 }}
      />
      {loading ? (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <Spin />
        </div>
      ) : (
        <div id="data-analysis-chart" style={{ width: '100%', height: '400px' }} />
      )}
    </Modal>
  );
};

export default DataAnalysisModal;