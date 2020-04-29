using Dapper;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using TT.Camp.Data.Repository.IRepository;
using TT.Camp.Data.Repository.UnitOfWork;

namespace TT.Camp.Data.Repository.Repository
{
    public abstract class BaseRepository<T> : IBaseRepository<T> where T : class
    {
        private readonly string _tableName;
        private readonly IUnitOfWork _unitOfWork;

        protected BaseRepository(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _tableName = GetTableName();
        }

        private string GetTableName()
        {


            return $"{EntityName}s";
        }

        private string EntityName => typeof(T).Name;

        private IEnumerable<PropertyInfo> GetProperties => typeof(T).GetProperties();

        public async Task<IEnumerable<T>> QueryAsync(string query, object parameters)
        {
            try
            {
                _unitOfWork.Begin();

                var result = await _unitOfWork.Connection.QueryAsync<T>(query, parameters);

                _unitOfWork.Commit();

                return result;
            }
            catch
            {
                _unitOfWork.Rollback();
                throw;
            }

        }

        public async Task<bool> QueryScalarAsync(string query, object parameters)
        {
            _unitOfWork.Begin();
            try
            {
                var result = await _unitOfWork.Connection.ExecuteScalarAsync<bool>(query, parameters);

                _unitOfWork.Commit();

                return result;
            }
            catch
            {
                _unitOfWork.Rollback();
                throw;
            }

        }
        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _unitOfWork.Connection.QueryAsync<T>($"SELECT * FROM {_tableName}");
        }

        public async Task DeleteRowAsync(int id)
        {
            _unitOfWork.Begin();
            try
            {
                await _unitOfWork.Connection.ExecuteAsync($"DELETE FROM {_tableName} WHERE Id=@Id", new { Id = id });

                _unitOfWork.Commit();
            }
            catch
            {
                _unitOfWork.Rollback();
                throw;
            }

        }

        public async Task<T> GetAsync(int id)
        {
            return await _unitOfWork.Connection.QuerySingleOrDefaultAsync<T>($"SELECT * FROM {_tableName} WHERE Id=@Id", new { Id = id });
        }


        public async Task<T> GetAsync(string query, object parameters)
        {
            return await _unitOfWork.Connection.QuerySingleOrDefaultAsync<T>(query, parameters);
        }

        public async Task<object> GetSpAsync(string query, DynamicParameters parameters)
        {
            var result = await _unitOfWork.Connection.QueryAsync<object>(query, parameters, commandType: CommandType.StoredProcedure);

            return result.FirstOrDefault();
        }


        public async Task<int> SaveRangeAsync(IEnumerable<T> list)
        {
            var inserted = 0;
            try
            {
                var query = GenerateInsertQuery();

                _unitOfWork.Begin();

                inserted += await _unitOfWork.Connection.ExecuteAsync(query, list);

                _unitOfWork.Commit();
            }
            catch
            {
                _unitOfWork.Rollback();
                throw;
            }



            return inserted;
        }

        public async Task<int> InsertAsync(T t)
        {
            try
            {
                var insertQuery = GenerateInsertQuery();
                var query = AppendGetLastInsertedIdQuery(insertQuery);

                _unitOfWork.Begin();

                var result = await _unitOfWork.Connection.QueryAsync<int>(query, t);

                _unitOfWork.Commit();

                return result.Single();
            }
            catch
            {
                _unitOfWork.Rollback();
                throw;
            }
        }
        public async Task<int> UpdateAsync(T t)
        {
            try
            {
                var updateQuery = GenerateUpdateQuery();

                _unitOfWork.Begin();

                var result = await _unitOfWork.Connection.ExecuteAsync(updateQuery, t);

                _unitOfWork.Commit();

                return result;
            }
            catch
            {
                _unitOfWork.Rollback();
                throw;
            }
        }
        private string GenerateInsertQuery()
        {
            var insertQuery = new StringBuilder($"INSERT INTO {_tableName} ");

            insertQuery.Append("(");

            var properties = GenerateListOfProperties(GetProperties);
            properties.ForEach(prop => { insertQuery.Append($"{prop},"); });

            insertQuery
                .Remove(insertQuery.Length - 1, 1)
                .Append(") VALUES (");

            properties.ForEach(prop => { insertQuery.Append($"@{prop},"); });

            insertQuery
                .Remove(insertQuery.Length - 1, 1)
                .Append(");");

            return insertQuery.ToString();
        }
        private string GenerateUpdateQuery()
        {
            var updateQuery = new StringBuilder($"UPDATE {_tableName} SET ");
            var properties = GenerateListOfProperties(GetProperties);

            properties.ForEach(property =>
            {
                if (!property.Equals("Id"))
                {
                    updateQuery.Append($"{property}=@`{property}`,");
                }
            });

            updateQuery.Remove(updateQuery.Length - 1, 1); //remove last comma
            updateQuery.Append(" WHERE Id=@Id");

            return updateQuery.ToString();
        }
        private static List<string> GenerateListOfProperties(IEnumerable<PropertyInfo> listOfProperties)
        {
            return (from prop in listOfProperties
                    let attributes = prop.GetCustomAttributes(typeof(DescriptionAttribute), false)
                    where attributes.Length <= 0 || (attributes[0] as DescriptionAttribute)?.Description != "ignore"
                    select prop.Name).ToList();
        }
        private string AppendGetLastInsertedIdQuery(string query)
        {
            return $"{query} SELECT last_insert_id();";
        }

    }
}
