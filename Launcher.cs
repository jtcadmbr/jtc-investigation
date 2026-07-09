using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;
using System.Drawing;

namespace JTCInvestigationLauncher
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            string configPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "config.txt");
            string url = "";

            if (File.Exists(configPath))
            {
                url = File.ReadAllText(configPath).Trim();
            }

            if (string.IsNullOrEmpty(url))
            {
                url = ShowUrlInputDialog();
                if (string.IsNullOrEmpty(url))
                {
                    return; // Cancelado pelo usuário
                }
                try
                {
                    File.WriteAllText(configPath, url);
                }
                catch (Exception ex)
                {
                    MessageBox.Show("Não foi possível salvar o arquivo de configuração: " + ex.Message, "JTC Investigação", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                }
            }

            // Localiza navegadores suportados (Edge ou Chrome)
            string edgePath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
            string chromePath = @"C:\Program Files\Google\Chrome\Application\chrome.exe";
            
            string browserPath = "";
            string arguments = "";

            if (File.Exists(edgePath))
            {
                browserPath = edgePath;
                arguments = "--app=\"" + url + "\"";
            }
            else if (File.Exists(chromePath))
            {
                browserPath = chromePath;
                arguments = "--app=\"" + url + "\"";
            }
            else
            {
                // Fallback para navegador padrão
                try
                {
                    Process.Start(url);
                }
                catch (Exception ex)
                {
                    MessageBox.Show("Erro ao abrir o navegador padrão: " + ex.Message, "JTC Investigação", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
                return;
            }

            try
            {
                Process.Start(browserPath, arguments);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Erro ao iniciar o aplicativo: " + ex.Message, "JTC Investigação", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private static string ShowUrlInputDialog()
        {
            Form prompt = new Form()
            {
                Width = 460,
                Height = 200,
                FormBorderStyle = FormBorderStyle.FixedDialog,
                Text = "JTC Investigação - Configuração Inicial",
                StartPosition = FormStartPosition.CenterScreen,
                MaximizeBox = false,
                MinimizeBox = false,
                BackColor = Color.FromArgb(20, 20, 25),
                ForeColor = Color.White
            };

            Label textLabel = new Label() 
            { 
                Left = 20, 
                Top = 15, 
                Width = 400, 
                Height = 40,
                Text = "Digite a URL do sistema JTC Investigação:\n(Ex: https://seu-dominio.com ou http://localhost:3000)",
                Font = new Font("Segoe UI", 9.5F, FontStyle.Bold)
            };
            
            TextBox textBox = new TextBox() 
            { 
                Left = 20, 
                Top = 60, 
                Width = 400,
                Font = new Font("Segoe UI", 10F),
                BackColor = Color.FromArgb(30, 30, 35),
                ForeColor = Color.White,
                BorderStyle = BorderStyle.FixedSingle
            };
            
            Button confirmation = new Button() 
            { 
                Text = "Iniciar Sistema", 
                Left = 20, 
                Width = 400, 
                Top = 105, 
                Height = 38,
                DialogResult = DialogResult.OK,
                Font = new Font("Segoe UI", 10F, FontStyle.Bold),
                BackColor = Color.FromArgb(0, 150, 136),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat
            };
            confirmation.FlatAppearance.BorderSize = 0;

            textBox.Text = "http://localhost:3000";

            prompt.Controls.Add(textBox);
            prompt.Controls.Add(confirmation);
            prompt.Controls.Add(textLabel);
            prompt.AcceptButton = confirmation;

            try
            {
                prompt.Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath);
            }
            catch {}

            return prompt.ShowDialog() == DialogResult.OK ? textBox.Text.Trim() : "";
        }
    }
}
