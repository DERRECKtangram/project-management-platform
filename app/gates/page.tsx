import { AppShell } from "../components/AppShell";
import { gateSteps, statusText } from "../data";

const gates = ["第一大關", "第二大關", "第三大關", "第四大關"];

export default function GatesPage() {
  return (
    <AppShell
      active="/gates"
      eyebrow="四大關任務"
      title="從提案到結案的關卡檢核"
      actions={<button className="secondary-action">編輯關卡規則</button>}
    >
      <section className="gate-lanes">
        {gates.map((gate) => {
          const steps = gateSteps.filter((step) => step.gate === gate);
          return (
            <article className="gate-lane" key={gate}>
              <header className={steps[0].color}>
                <span>{gate}</span>
                <h2>{steps.map((step) => step.title).join(" / ")}</h2>
              </header>
              {steps.map((step) => (
                <section className="gate-step-card" key={step.title}>
                  <div className="step-number">{step.step}</div>
                  <div>
                    <h3>{step.title}</h3>
                    <dl>
                      <div>
                        <dt>主要任務</dt>
                        <dd>{step.mission}</dd>
                      </div>
                      <div>
                        <dt>完成條件</dt>
                        <dd>{step.condition}</dd>
                      </div>
                      <div>
                        <dt>好處</dt>
                        <dd>{step.benefit}</dd>
                      </div>
                      <div>
                        <dt>下一步</dt>
                        <dd>{step.next}</dd>
                      </div>
                    </dl>
                    <footer>
                      <span>負責：{step.owner}</span>
                      <b className={`status-badge ${step.status}`}>{statusText[step.status]}</b>
                    </footer>
                  </div>
                </section>
              ))}
            </article>
          );
        })}
      </section>
    </AppShell>
  );
}
