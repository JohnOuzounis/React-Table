import { useState } from 'react';
import { FaEye } from 'react-icons/fa';
import './App.css';
import Table from './components/table/Table';

function App() {
    const TABLE_HEADER = [
        {
            Header: 'id',
            name: 'id',
            width: 85,
        },
        {
            Header: 'Name',
            name: 'customerName',
            width: 180,
        },
        {
            Header: 'Actions',
            field: row => {
                return (
                    <FaEye
                        color='var(--theme-primary)'
                        onClick={() => {
                            console.log(row.data);
                        }}
                    />
                );
            },
            width: 90,
        },
    ];

    const data = [
        { id: 10, customerName: 'bobo' },
        { id: 15, customerName: 'lala' },
        { id: 3, customerName: 'lalo' },
        { id: 10, customerName: 'bobo' },
        { id: 15, customerName: 'lala' },
        { id: 3, customerName: 'lalo' },
        { id: 10, customerName: 'bobo' },
        { id: 15, customerName: 'lala' },
        { id: 3, customerName: 'lalo' },
        { id: 10, customerName: 'bobo' },
        { id: 15, customerName: 'lala' },
        { id: 3, customerName: 'lalo' },
    ];

    return (
        <>
            <div className='container'>
                <Table
                    description={TABLE_HEADER}
                    data={data}
                    itemsPerPage={4}
                />
            </div>
        </>
    );
}

export default App;
