using System;
using System.Collections.Generic;
using System.Data;
using System.Text;
using TT.Camp.Data.Repository.IRepository;

namespace TT.Camp.Data.Repository.UnitOfWork
{
    public interface IUnitOfWork : IDisposable
    {
        Guid Id { get; }
        IDbConnection Connection { get; }
        IDbTransaction Transaction { get; }
        void Begin();
        void Commit();
        void Rollback();

    }
}
