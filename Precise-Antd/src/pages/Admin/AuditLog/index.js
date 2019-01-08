import React, { Component } from 'react';
import {
    Card, Col, Row, Button, Divider, Table, Tag, Dropdown, Menu, Form, Modal,
    DatePicker,
    InputNumber,
    Input,
    Select,
    Icon,
    Tooltip,
} from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { truncateStringWithPostfix } from '@/utils/utils';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './index.less';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const dateRanges = [moment().subtract(7, "day").format('YYYY-MM-D h:mm:ss.sssssss'), moment().format('YYYY-MM-D h:mm:ss.sssssss')];

@Form.create()
@connect(({ auditlog, loading }) => ({
    auditlog,
    listLoading: loading.effects['auditlog/getAuditLogs'],
}))
class AuditLogList extends Component {
    state = {
        formValues: {
            StartDate: dateRanges[0],
            EndDate: dateRanges[1],
            UserName: "",
            ServiceName: "",
            MethodName: "",
            HasException: null,
            MinExecutionDuration: 0,
            MaxExecutionDuration: 100,
            MaxResultCount: 10,
            SkipCount: 0,
        },
        expandForm: false,
    };

    componentDidMount() {
        this.getAuditLogs();
    }

    getAuditLogs() {
        const { dispatch } = this.props;
        dispatch({
            type: 'auditlog/getAuditLogs',
            payload: this.state.formValues,
        });
    }

    handleTableChange = (pagination) => {
        const { formValues } = this.state;
        formValues.SkipCount = (pagination.current - 1) * this.state.formValues.MaxResultCount;
        this.setState({ formValues: formValues }, this.getAuditLogs());
    };

    handleSearch = e => {
        e.preventDefault();
        const { dispatch, form } = this.props;
        const { formValues } = this.state;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            formValues.StartDate = moment(fieldsValue.DateRange[0]).format('YYYY-MM-D h:mm:ss.sssssss');
            formValues.EndDate = moment(fieldsValue.DateRange[1]).format('YYYY-MM-D h:mm:ss.sssssss');
            formValues.ServiceName = fieldsValue.ServiceName;
            formValues.UserName = fieldsValue.UserName;
            formValues.MinExecutionDuration = fieldsValue.MinExecutionDuration;
            formValues.MaxExecutionDuration = fieldsValue.MaxExecutionDuration;
            formValues.MethodName = fieldsValue.MethodName;
            formValues.HasException = fieldsValue.HasException;
            this.setState({ formValues: formValues }, this.getAuditLogs());
        });
    };


    handleFormReset = () => {

    };

    toggleForm = () => {
        const { expandForm } = this.state.formValues;
        this.setState({
            expandForm: !expandForm,
        });
    };

    renderSimpleForm() {
        const {
            form: { getFieldDecorator },
        } = this.props;
        return (
            <Form onSubmit={this.handleSearch} layout="inline">
                <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                    <Col md={8} sm={24}>
                        <FormItem label="日期范围">
                            {getFieldDecorator('DateRange', { initialValue: [moment(dateRanges[0], 'YYYY/MM/DD'), moment(dateRanges[1], 'YYYY/MM/DD')] })(<RangePicker />)}
                        </FormItem>
                    </Col>
                    <Col md={8} sm={24}>
                        <FormItem label="用户名">
                            {getFieldDecorator('UserName')(<Input placeholder="请输入" />)}
                        </FormItem>
                    </Col>
                    <Col md={8} sm={24}>
                        <span className={styles.submitButtons}>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
                            <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>展开 <Icon type="down" /></a>
                        </span>
                    </Col>
                </Row>
            </Form>
        );
    }

    renderAdvancedForm() {
        const {
            form: { getFieldDecorator },
        } = this.props;
        return (
            <Form onSubmit={this.handleSearch} layout="inline">
                <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                    <Col md={8} sm={24}>
                        <FormItem label="日期范围">
                            {getFieldDecorator('DateRange')(<RangePicker />)}
                        </FormItem>
                    </Col>
                    <Col md={8} sm={24}>
                        <FormItem label="用户名">
                            {getFieldDecorator('UserName')(<Input placeholder="请输入" />)}
                        </FormItem>
                    </Col>
                    <Col md={8} sm={24}>
                        <FormItem label="服务">
                            {getFieldDecorator('ServiceName')(<Input placeholder="请输入" />)}
                        </FormItem>
                    </Col>
                </Row>
                <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                    <Col md={8} sm={24}>
                        <FormItem label="持续时间">
                            {getFieldDecorator('MinExecutionDuration')(<InputNumber style={{ width: '45%' }} />)}
                            <span style={{ width: '10%' }}>---</span>
                            {getFieldDecorator('MaxExecutionDuration')(<InputNumber style={{ width: '45%' }} />)}
                        </FormItem>
                    </Col>
                    <Col md={8} sm={24}>
                        <FormItem label="操作">
                            {getFieldDecorator('MethodName')(<Input placeholder="请输入" />)}
                        </FormItem>
                    </Col>
                    <Col md={8} sm={24}>
                        <FormItem label="错误状态">
                            {getFieldDecorator('HasException')(
                                <Select placeholder="请选择" style={{ width: '100%' }}>
                                    <Option value="">全部</Option>
                                    <Option value="false">成功</Option>
                                    <Option value="true">出现错误</Option>
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                </Row>
                <div style={{ overflow: 'hidden' }}>
                    <div style={{ float: 'right', marginBottom: 24 }}>
                        <Button type="primary" htmlType="submit">
                            查询
                </Button>
                        <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                            重置
                </Button>
                        <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                            收起 <Icon type="up" />
                        </a>
                    </div>
                </div>
            </Form>
        );
    }

    renderForm() {
        const { expandForm } = this.state;
        return expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
    }

    render() {
        const columns = [
            {
                title: '用户名', dataIndex: 'exception', key: 'exception',
                render: (text, row, index) => {
                    if (text)
                        return <Icon type="close-circle" theme="twoTone" twoToneColor="#F5222D" />
                    else
                        return <Icon type="check-circle" theme="twoTone" twoToneColor="#1890FF" />
                },
            },
            {
                title: '时间', dataIndex: 'executionTime', key: 'executionTime',
                render: (text, row, index) => {
                    return moment(text).format('YYYY年MM月D日 h:mm:ss')
                },
            },
            { title: '用户名', dataIndex: 'userName', key: 'userName', },
            { title: '服务', dataIndex: 'serviceName', key: 'serviceName', },
            { title: '操作', dataIndex: 'methodName', key: 'methodName', },
            {
                title: '持续时间', dataIndex: 'executionDuration', key: 'executionDuration',
                render: (text, row, index) => {
                    return text + "ms";
                },
            },
            { title: 'IP地址', dataIndex: 'clientIpAddress', key: 'clientIpAddress', },
            {
                title: '浏览器', dataIndex: 'browserInfo', key: 'browserInfo',
                render: (text, row, index) => {
                    return (<Tooltip title={text}>
                        {truncateStringWithPostfix(text, 20)}
                    </Tooltip>);
                },
            },
            {
                title: '操作', key: 'action',
                render: () => (
                    <span>
                        <a href="javascript:;">查看</a>
                    </span>
                ),
            }];

        const {
            listLoading,
            auditlog: { data },
        } = this.props;

        return (
            <PageHeaderWrapper title="审计日志">
                <Card bordered={false}>
                    <div className={styles.tableList}>
                        <div className={styles.tableListForm}>{this.renderForm()}</div>
                        <div className={styles.tableListOperator}>

                        </div>
                        <Table
                            rowKey={record => record.id}
                            size={'middle'}
                            columns={columns}
                            pagination={{ pageSize: 10, total: data == undefined ? 0 : data.totalCount, defaultCurrent: 1 }}
                            loading={data == undefined ? true : false}
                            dataSource={data == undefined ? [] : data.items}
                            onChange={this.handleTableChange}
                            loading={listLoading}
                        />
                    </div>
                </Card>
            </PageHeaderWrapper>
        );
    }
}

export default AuditLogList;