using System;
using System.ComponentModel.DataAnnotations;

namespace TempMail.Models;

public class User
{
    [Key]
    public int UserId { get; set; }

    [Required]
    public Guid SessionId { get; set; } = Guid.NewGuid();

    [Required]
    public DateTime CreationTime { get; set; } = DateTime.UtcNow;

    
    public Email? Email { get; set; }
}