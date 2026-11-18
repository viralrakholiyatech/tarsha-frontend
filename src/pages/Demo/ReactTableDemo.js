import React from 'react'
import { useMemo } from 'react';
import { useEffect } from 'react';
import { useState } from 'react'
import { useSortBy, useTable,usePagination,useGlobalFilter } from 'react-table';

const ReactTableDemo = () => {


    const [data,setData] = useState([]);

   
      const fetchData = () =>{
        setData([
            {
                id : 1,
                name : "Dhawal Parmar",
                card : "green"
            },
            {
                id : 2,
                name : "Abdeali Kachwala",
                card : "green"
            },
            {
                id : 3,
                name : "Murtuza Tarwala",
                card : "green"
            },
            {
                id : 4,
                name : "Ram Jaiswal",
                card : "green"
            },
            {
                id : 5,
                name : "Vihang Kapadiya",
                card : "green"
            }


            ,{
                id : 1,
                name : "Dhawal Parmar",
                card : "green"
            },
            {
                id : 2,
                name : "Abdeali Kachwala",
                card : "green"
            },
            {
                id : 3,
                name : "Murtuza Tarwala",
                card : "green"
            },
            {
                id : 4,
                name : "Ram Jaiswal",
                card : "green"
            },
            {
                id : 5,
                name : "Vihang Kapadiya",
                card : "green"
            }

            ,{
                id : 1,
                name : "Dhawal Parmar",
                card : "green"
            },
            {
                id : 2,
                name : "Abdeali Kachwala",
                card : "green"
            },
            {
                id : 3,
                name : "Murtuza Tarwala",
                card : "green"
            },
            {
                id : 4,
                name : "Ram Jaiswal",
                card : "green"
            },
            {
                id : 5,
                name : "Vihang Kapadiya",
                card : "green"
            }

            ,{
                id : 1,
                name : "Dhawal Parmar",
                card : "green"
            },
            {
                id : 2,
                name : "Abdeali Kachwala",
                card : "green"
            },
            {
                id : 3,
                name : "Murtuza Tarwala",
                card : "green"
            },
            {
                id : 4,
                name : "Ram Jaiswal",
                card : "green"
            },
            {
                id : 5,
                name : "Vihang Kapadiya",
                card : "green"
            }

            ,{
                id : 1,
                name : "Dhawal Parmar",
                card : "green"
            },
            {
                id : 2,
                name : "Abdeali Kachwala",
                card : "green"
            },
            {
                id : 3,
                name : "Murtuza Tarwala",
                card : "green"
            },
            {
                id : 4,
                name : "Ram Jaiswal",
                card : "green"
            },
            {
                id : 5,
                name : "Vihang Kapadiya",
                card : "green"
            }

            ,{
                id : 1,
                name : "Dhawal Parmar",
                card : "green"
            },
            {
                id : 2,
                name : "Abdeali Kachwala",
                card : "green"
            },
            {
                id : 3,
                name : "Murtuza Tarwala",
                card : "green"
            },
            {
                id : 4,
                name : "Ram Jaiswal",
                card : "green"
            },
            {
                id : 5,
                name : "Vihang Kapadiya",
                card : "green"
            }

            ,{
                id : 1,
                name : "Dhawal Parmar",
                card : "green"
            },
            {
                id : 2,
                name : "Abdeali Kachwala",
                card : "green"
            },
            {
                id : 3,
                name : "Murtuza Tarwala",
                card : "green"
            },
            {
                id : 4,
                name : "Ram Jaiswal",
                card : "green"
            },
            {
                id : 5,
                name : "Vihang Kapadiya",
                card : "green"
            }

            ,{
                id : 1,
                name : "Dhawal Parmar",
                card : "green"
            },
            {
                id : 2,
                name : "Abdeali Kachwala",
                card : "green"
            },
            {
                id : 3,
                name : "Murtuza Tarwala",
                card : "green"
            },
            {
                id : 4,
                name : "Ram Jaiswal",
                card : "green"
            },
            {
                id : 5,
                name : "Vihang Kapadiya",
                card : "green"
            }
          ]);
      }

   
      const columns = React.useMemo(
        () => [
          {
            Header: 'id',
            accessor: 'id', 
          },
          {
            Header: 'Name',
            accessor: 'name',
          },
          {
            Header: 'Card',
            accessor: 'card',
            Cell : ({value})=><span className="badge badge-success">{value?.toUpperCase()}</span>
          },
        ],
        []
      )


      React.useEffect(()=>{
        fetchData();
      },[]);

      const tableHooks = (hooks) =>{
        hooks.visibleColumns.push((columns)=>[
            ...columns,
            {
                id:"Edit",
                Header: 'Edit',
                Cell:({row})=>(
                    <div className="dropdown">
  <button className="btn btn-secondary" type="button" data-toggle="dropdown" aria-expanded="false">
    <b>:</b>
  </button>
  <div className="dropdown-menu">
    <a className="dropdown-item" href="#" onClick={()=>alert(`Edit : ${row.values.id}`)}>Edit</a>
    <a className="dropdown-item" href="#" onClick={()=>alert(`Delete : ${row.values.id}`)}>Delete</a>
    <a className="dropdown-item" href="#"  onClick={()=>alert(`See : ${row.values.id}`)}>See</a>
  </div>
</div>
                )
            }

        ])
      }
   

    

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        canPreviousPage,
        page,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        setGlobalFilter,
        state: { pageIndex, pageSize,globalFilter },
      } = useTable({ columns, data ,initialState: { pageIndex: 1 ,pageSize:4}},tableHooks,useGlobalFilter,useSortBy,usePagination);

      

  return (
    <div>
        <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter}/>
        <table className='table' {...getTableProps()}>
       <thead>
         {headerGroups.map(headerGroup => (
           <tr {...headerGroup.getHeaderGroupProps()}>
             {headerGroup.headers.map(column => (
               <th
                 {...column.getHeaderProps(column.getSortByToggleProps())}
               >
                {column.render('Header')}
                <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' 🔽'
                        : ' 🔼'
                      : ''}
                  </span>
               </th>
             ))}
           </tr>
         ))}
       </thead>
       <tbody {...getTableBodyProps()}>
         {/* {rows.map(row => { */}
         {page.map(row => {
           prepareRow(row)
           return (
             <tr {...row.getRowProps()}>
               {row.cells.map(cell => {
                 return (
                   <td
                     {...cell.getCellProps()}
                    
                   >
                     {cell.render('Cell')}
                   </td>
                 )
               })}
             </tr>
           )
         })}
       </tbody>
     </table>

     <div className="pagination">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {'<<'}
        </button>{' '}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {'<'}
        </button>{' '}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {'>'}
        </button>{' '}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {'>>'}
        </button>{' '}
        <span>
          Page{' '}
          <strong>
            {pageIndex} of {pageOptions.length}
          </strong>{' '}
        </span>
        <span>
          | Go to page:{' '}
          <input
            type="number"
            defaultValue={pageIndex }
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              gotoPage(page)
            }}
            style={{ width: '100px' }}
          />
        </span>{' '}
        <select
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value))
          }}
        >
          {[3,5].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>


        </div>
  )
}


const GlobalFilter = ({filter,setFilter}) =>{
    return (
        <span>
            Search :
            <input
                value={filter}
                onChange={(e)=>setFilter(e.target.value)} 
            />
        </span>
    )
}

export default ReactTableDemo
