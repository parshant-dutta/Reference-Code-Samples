using AutoMapper.Configuration;
using DbUp;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using TT.Camp.Common.StaticResources;
using TT.Camp.Core;

namespace TT.Camp.Data.Migration
{
    class Program
    {
        public static IConfigurationRoot Configuration;

        static void Main(string[] args)
        {
            // Set up configuration sources.
            var builder = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);

            Configuration = builder.Build();

            Console.WriteLine("Updating Database. Please stay tuned...");

            InitDatabase();
        }

        private static int InitDatabase()
        {
            var dbUpgradeEngineBuilder = DeployChanges.To
                .MySqlDatabase(Configuration.GetConnectionString("ApplicationContext"))
                .WithScriptsEmbeddedInAssembly(typeof(Program).Assembly)
                .WithTransaction()
                .LogToConsole();

            var dbUpgradeEngine = dbUpgradeEngineBuilder.Build();
            if (dbUpgradeEngine.IsUpgradeRequired())
            {
                Console.WriteLine("Upgrades have been detected. Upgrading database now...");
                var operation = dbUpgradeEngine.PerformUpgrade();
                if (operation.Successful)
                {
                    Console.WriteLine("Upgrade completed successfully");
                    Console.ReadLine();

                    return 0;
                }

                Console.WriteLine("Error happened in the upgrade. Please check the logs");
                Console.ReadLine();

                return -1;
            }

            return 0;

        }
    }
}
