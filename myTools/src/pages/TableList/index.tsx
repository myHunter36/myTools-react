import React, { useState } from 'react';
import { Table, Modal, Button, Input, DatePicker, Form, InputNumber, Select, message } from 'antd';
import moment from 'moment'; // 引入moment处理日期

const { Option } = Select;
const { RangePicker } = DatePicker;

interface LedgerEntry {
  id: number;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
}

const LedgerForm: React.FC = () => {
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<string | null>(null);
  const [form] = Form.useForm();

  const showAddModal = () => {
    setCurrentEntry(null); // 清除当前条目以表示创建新条目
    setIsModalVisible(true);
  };

  const showEditModal = (entry: LedgerEntry) => {
    setCurrentEntry(entry);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...entry,
      date: moment(entry.date),
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      const newEntry: LedgerEntry = {
        id: currentEntry?.id ?? Date.now(),
        date: values.date.format('YYYY-MM-DD'),
        category: values.category,
        description: values.description,
        amount: values.amount,
        paymentMethod: values.paymentMethod,
      };
      if (currentEntry) {
        setLedger(ledger.map(entry => (entry.id === currentEntry.id ? newEntry : entry)));
      } else {
        setLedger([...ledger, newEntry]);
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleDelete = (id: number) => {
    setLedger(ledger.filter(entry => entry.id !== id));
  };

  const columns = [
    {
      title: '交易日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      filters: [
        { text: '现金', value: 'cash' },
        { text: '信用卡', value: 'creditCard' },
        { text: '转账', value: 'transfer' },
        // ...其他支付方式
      ],
      onFilter: (value, record) => record.paymentMethod.indexOf(value) === 0,
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: LedgerEntry) => (
        <>
          <Button onClick={() => showEditModal(record)} style={{ marginRight: 8 }}>
            Edit
          </Button>
          <Button onClick={() => handleDelete(record.id)} danger>
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <div>
        通过日期筛选 :
        <RangePicker
          onChange={(dates) => {
            const startDate = dates && dates[0] ? dates[0].startOf('day') : null;
            const endDate = dates && dates[1] ? dates[1].endOf('day') : null;
            console.log(dates,  startDate,  endDate, 'dates');
            if(startDate && endDate) {
              const filteredData = ledger.filter((entry) => {
                const entryDate = moment(entry.date);
                return (!startDate || entryDate.isSameOrAfter(startDate)) &&
                      (!endDate || entryDate.isSameOrBefore(endDate));
              });
              setLedger(filteredData);
            }
            
            // setStartDate(dates ? dates[0].startOf('day') : null);
            // setEndDate(dates ? dates[1].endOf('day') : null);
          }}
          style={{ margin: 16, marginTop: 0 }}
        />
      </div>
      
      <Button type="primary" onClick={showAddModal} style={{ marginBottom: 16 }}>
        新建
      </Button>
      <Table dataSource={ledger} columns={columns} rowKey="id" />

      <Modal title={currentEntry ? '编辑账单' : '新建账单'} open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} layout="vertical">
          <Form.Item name="date" label="交易日期" rules={[{ required: true, message: 'Please select the date!' }]}>
            <DatePicker />
          </Form.Item>
          <Form.Item name="category" label="类别" rules={[{ required: true, message: 'Please input the category!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述" rules={[{ required: true, message: 'Please input the description!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="amount" label="金额" rules={[{ required: true, message: 'Please input the amount!' }]}>
            <InputNumber />
          </Form.Item>
          <Form.Item name="paymentMethod" label="支付方式" rules={[{ required: true, message: 'Please select the payment method!' }]}>
            <Select>
              <Option value="cash">现金</Option>
              <Option value="creditCard">信用卡</Option>
              <Option value="transfer">转账</Option>
              {/* 添加更多的支付方式选项 */}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LedgerForm;