using DitsPortal.DataAccess.Base.DBEntities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DitsPortal.DataAccess.DBEntities
{
    public class EmployeeHistories
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public int EmploymentHistoryId { get; set; }
        public int UserId { get; set; }
        [Column(TypeName = "varchar(50)")]
        public String Experience { get; set; }
        [Column(TypeName = "Datetime")]
        public DateTime From { get; set; }
        [Column(TypeName = "Datetime")]
        public DateTime To { get; set; }
        [Column(TypeName = "varchar(50)")]
        public String Position { get; set; }
        [Column(TypeName = "varchar(100)")]
        public String Description { get; set; }
    }
}
