using System;
using System.Collections.Generic;
using System.Data;
using System.Text;
using TT.Camp.Data.Repository.IRepository;
using TT.Camp.Data.Repository.Repository;
using MySql.Data.MySqlClient;

namespace TT.Camp.Data.Repository.UnitOfWork
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly string _connectionString;

        //IDbConnection _connection = null;
        IDbTransaction _transaction = null;
        Guid _id = Guid.Empty;

        public UnitOfWork(string connectionString)
        {
            _id = Guid.NewGuid();

            _connectionString = connectionString;
        }

        public IDbConnection Connection
        {
            get
            {
                var conn = new MySqlConnection(_connectionString);
                conn.Open();
                return conn;
            }
        }

        IDbTransaction IUnitOfWork.Transaction
        {
            get { return _transaction; }
        }

        Guid IUnitOfWork.Id
        {
            get { return _id; }
        }


        public void Begin()
        {
            _transaction = Connection.BeginTransaction();
        }

        public void Commit()
        {
            try
            {
                _transaction.Commit();
                _transaction.Connection?.Close();
            }
            catch
            {
                _transaction.Rollback();
                throw;
            }
            finally
            {
                Dispose();
            }
        }

        public void Rollback()
        {
            try
            {
                _transaction.Rollback();
                _transaction.Connection?.Close();
            }
            catch
            {
                throw;
            }
            finally
            {
                Dispose();
            }
        }

        public void Dispose()
        {
            if (_transaction != null)
            {
                _transaction.Dispose();
                _transaction.Connection?.Dispose();
            }
            _transaction = null;
        }
    }
}
